import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  Product,
  UpgradeProduct,
  ConditionDeduction,
  InstallmentRate,
  ProductCategory,
  DEFAULT_PRODUCTS,
  DEFAULT_UPGRADE_PRODUCTS,
  DEFAULT_CONDITION_DEDUCTIONS,
  DEFAULT_INSTALLMENT_RATES,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_ORCAMENTO_CLOSING,
} from "@/lib/data";
import { trpc } from "@/lib/trpc";

// --- Storage Keys (fallback local) ---
const DATA_VERSION = "v4";
const KEYS = {
  products: `tiosam-products-${DATA_VERSION}`,
  upgradeProducts: `tiosam-upgrade-${DATA_VERSION}`,
  deductions: `tiosam-deductions-${DATA_VERSION}`,
  rates: `tiosam-rates-${DATA_VERSION}`,
  categories: `tiosam-categories-${DATA_VERSION}`,
  closingText: `tiosam-closing-${DATA_VERSION}`,
  storeName: `tiosam-storename-${DATA_VERSION}`,
  dataVersion: "tiosam-data-version",
} as const;

// --- Config State ---
interface ConfigState {
  products: Product[];
  upgradeProducts: UpgradeProduct[];
  conditionDeductions: ConditionDeduction[];
  installmentRates: InstallmentRate[];
  productCategories: ProductCategory[];
  closingText: string;
  storeName: string;
}

interface ConfigContextType extends ConfigState {
  // Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  // Upgrade Products
  addUpgradeProduct: (product: UpgradeProduct) => void;
  updateUpgradeProduct: (id: string, product: Partial<UpgradeProduct>) => void;
  removeUpgradeProduct: (id: string) => void;
  // Deductions
  addDeduction: (deduction: ConditionDeduction) => void;
  updateDeduction: (id: string, deduction: Partial<ConditionDeduction>) => void;
  removeDeduction: (id: string) => void;
  // Rates
  addRate: (rate: InstallmentRate) => void;
  updateRate: (installments: number, rate: Partial<InstallmentRate>) => void;
  removeRate: (installments: number) => void;
  // Categories
  addCategory: (category: ProductCategory) => void;
  updateCategory: (id: string, category: Partial<ProductCategory>) => void;
  removeCategory: (id: string) => void;
  // Closing text
  setClosingText: (text: string) => void;
  // Store name
  setStoreName: (name: string) => void;
  // Reset
  resetAll: () => void;
  resetProducts: () => void;
  resetUpgradeProducts: () => void;
  resetDeductions: () => void;
  resetRates: () => void;
  // Sync status
  isSyncing: boolean;
  lastSyncError: string | null;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

function mergeProducts(stored: Product[], defaults: Product[]): Product[] {
  const storedMap = new Map(stored.map(p => [p.id, p]));
  const merged: Product[] = [];
  const seenIds = new Set<string>();
  for (const def of defaults) {
    const existing = storedMap.get(def.id);
    if (existing && existing.price > 0) {
      merged.push({ ...def, price: existing.price });
    } else {
      merged.push(def);
    }
    seenIds.add(def.id);
  }
  Array.from(storedMap.values()).forEach(s => {
    if (!seenIds.has(s.id)) merged.push(s);
  });
  return merged;
}

function mergeUpgradeProducts(stored: UpgradeProduct[], defaults: UpgradeProduct[]): UpgradeProduct[] {
  const storedMap = new Map(stored.map(p => [p.id, p]));
  const merged: UpgradeProduct[] = [];
  const seenIds = new Set<string>();
  for (const def of defaults) {
    const existing = storedMap.get(def.id);
    if (existing && existing.tradeInValue !== def.tradeInValue) {
      merged.push({ ...def, tradeInValue: existing.tradeInValue });
    } else {
      merged.push(def);
    }
    seenIds.add(def.id);
  }
  Array.from(storedMap.values()).forEach(s => {
    if (!seenIds.has(s.id)) merged.push(s);
  });
  return merged;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  // ─── State ───────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = loadFromStorage<Product[] | null>(KEYS.products, null);
    if (stored) return mergeProducts(stored, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  });
  const [upgradeProducts, setUpgradeProducts] = useState<UpgradeProduct[]>(() => {
    const stored = loadFromStorage<UpgradeProduct[] | null>(KEYS.upgradeProducts, null);
    if (stored) return mergeUpgradeProducts(stored, DEFAULT_UPGRADE_PRODUCTS);
    return DEFAULT_UPGRADE_PRODUCTS;
  });
  const [conditionDeductions, setConditionDeductions] = useState<ConditionDeduction[]>(() =>
    loadFromStorage(KEYS.deductions, DEFAULT_CONDITION_DEDUCTIONS)
  );
  const [installmentRates, setInstallmentRates] = useState<InstallmentRate[]>(() =>
    loadFromStorage(KEYS.rates, DEFAULT_INSTALLMENT_RATES)
  );
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(() =>
    loadFromStorage(KEYS.categories, DEFAULT_PRODUCT_CATEGORIES)
  );
  const [closingText, setClosingTextState] = useState<string>(() =>
    loadFromStorage(KEYS.closingText, DEFAULT_ORCAMENTO_CLOSING)
  );
  const [storeName, setStoreNameState] = useState<string>(() =>
    loadFromStorage(KEYS.storeName, "")
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const hasLoadedFromDb = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── tRPC: buscar storeId ────────────────────────
  const storeIdQuery = trpc.stores.my.getStoreId.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ─── tRPC: buscar config da loja ─────────────────
  const configQuery = trpc.stores.my.getConfig.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!storeIdQuery.data?.storeId,
  });

  // ─── tRPC: mutation para sincronizar ─────────────
  const syncMutation = trpc.stores.my.syncConfig.useMutation({
    onError: (err) => {
      setLastSyncError(err.message);
      setIsSyncing(false);
    },
    onSuccess: () => {
      setLastSyncError(null);
      setIsSyncing(false);
    },
  });

  // ─── Carregar storeId ────────────────────────────
  useEffect(() => {
    if (storeIdQuery.data?.storeId) {
      setStoreId(storeIdQuery.data.storeId);
    }
  }, [storeIdQuery.data]);

  // ─── Carregar dados do banco quando disponível ───
  useEffect(() => {
    if (!configQuery.data || hasLoadedFromDb.current) return;
    const cfg = configQuery.data;
    hasLoadedFromDb.current = true;

    // Se a loja tem configurações no banco, usar elas
    // Caso contrário, manter os dados locais (que podem ser os defaults)

    // Taxas da maquininha → installmentRates
    if (cfg.machineFees && cfg.machineFees.length > 0) {
      const dbRates: InstallmentRate[] = cfg.machineFees.map((f: any) => ({
        installments: f.installments,
        rate: parseFloat(f.ratePercentage || "0"),
        label: f.label || `${f.installments}x`,
      }));
      setInstallmentRates(dbRates);
      saveToStorage(KEYS.rates, dbRates);
    }

    // Condições de aparelhos → conditionDeductions
    if (cfg.deviceConditions && cfg.deviceConditions.length > 0) {
      const dbDeductions: ConditionDeduction[] = cfg.deviceConditions.map((c: any) => ({
        id: c.conditionKey || `cond-${c.id}`,
        label: c.label,
        description: c.description || "",
        defaultValue: parseFloat(c.deductionValue || "0"),
        icon: c.icon || "alert-triangle",
        category: mapCategory(c.category),
      }));
      setConditionDeductions(dbDeductions);
      saveToStorage(KEYS.deductions, dbDeductions);
    }

    // Configurações da loja (texto de fechamento, nome)
    if (cfg.settings) {
      if (cfg.settings.quoteClosingText) {
        setClosingTextState(cfg.settings.quoteClosingText);
        saveToStorage(KEYS.closingText, cfg.settings.quoteClosingText);
      }
    }

    // Nome da loja
    if (cfg.storeId) {
      // Buscar nome da loja se disponível no settings ou store
    }
  }, [configQuery.data]);

  // Mapear categorias do banco para o formato do front-end
  function mapCategory(dbCategory: string): "estado" | "bateria" | "funcionalidade" | "garantia" {
    switch (dbCategory) {
      case "estetica": return "estado";
      case "funcionalidade": return "funcionalidade";
      case "garantia": return "garantia";
      default: return "estado";
    }
  }

  function mapCategoryToDb(frontCategory: string): "estetica" | "funcionalidade" | "garantia" {
    switch (frontCategory) {
      case "estado": return "estetica";
      case "bateria": return "estetica";
      case "funcionalidade": return "funcionalidade";
      case "garantia": return "garantia";
      default: return "estetica";
    }
  }

  // ─── Debounced sync para o banco ─────────────────
  const scheduleSyncToDb = useCallback(() => {
    if (!storeId) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncToDb();
    }, 2000); // Espera 2 segundos após a última alteração
  }, [storeId]);

  const syncToDb = useCallback(() => {
    if (!storeId) return;
    setIsSyncing(true);
    syncMutation.mutate({
      storeId,
      storeName: storeName || undefined,
      quoteClosingText: closingText || undefined,
      machineFees: installmentRates.map(r => ({
        installments: r.installments,
        ratePercentage: String(r.rate),
        label: r.label,
        isActive: true,
      })),
      deviceConditions: conditionDeductions.map(d => ({
        conditionKey: d.id,
        label: d.label,
        description: d.description,
        deductionValue: String(d.defaultValue),
        category: mapCategoryToDb(d.category),
        icon: d.icon,
        isActive: true,
      })),
    });
  }, [storeId, storeName, closingText, installmentRates, conditionDeductions, syncMutation]);

  // ─── Auto-save local + agendar sync BD ───────────
  useEffect(() => { saveToStorage(KEYS.products, products); scheduleSyncToDb(); }, [products]);
  useEffect(() => { saveToStorage(KEYS.upgradeProducts, upgradeProducts); scheduleSyncToDb(); }, [upgradeProducts]);
  useEffect(() => { saveToStorage(KEYS.deductions, conditionDeductions); scheduleSyncToDb(); }, [conditionDeductions]);
  useEffect(() => { saveToStorage(KEYS.rates, installmentRates); scheduleSyncToDb(); }, [installmentRates]);
  useEffect(() => { saveToStorage(KEYS.categories, productCategories); }, [productCategories]);
  useEffect(() => { saveToStorage(KEYS.closingText, closingText); scheduleSyncToDb(); }, [closingText]);
  useEffect(() => { saveToStorage(KEYS.storeName, storeName); scheduleSyncToDb(); }, [storeName]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // ─── Products ────────────────────────────────────
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ─── Upgrade Products ───────────────────────────
  const addUpgradeProduct = useCallback((product: UpgradeProduct) => {
    setUpgradeProducts(prev => [...prev, product]);
  }, []);

  const updateUpgradeProduct = useCallback((id: string, updates: Partial<UpgradeProduct>) => {
    setUpgradeProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeUpgradeProduct = useCallback((id: string) => {
    setUpgradeProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ─── Deductions ─────────────────────────────────
  const addDeduction = useCallback((deduction: ConditionDeduction) => {
    setConditionDeductions(prev => [...prev, deduction]);
  }, []);

  const updateDeduction = useCallback((id: string, updates: Partial<ConditionDeduction>) => {
    setConditionDeductions(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const removeDeduction = useCallback((id: string) => {
    setConditionDeductions(prev => prev.filter(d => d.id !== id));
  }, []);

  // ─── Rates ──────────────────────────────────────
  const addRate = useCallback((rate: InstallmentRate) => {
    setInstallmentRates(prev => [...prev, rate].sort((a, b) => a.installments - b.installments));
  }, []);

  const updateRateFn = useCallback((installments: number, updates: Partial<InstallmentRate>) => {
    setInstallmentRates(prev => prev.map(r =>
      r.installments === installments ? { ...r, ...updates } : r
    ));
  }, []);

  const removeRate = useCallback((installments: number) => {
    setInstallmentRates(prev => prev.filter(r => r.installments !== installments));
  }, []);

  // ─── Categories ─────────────────────────────────
  const addCategory = useCallback((category: ProductCategory) => {
    setProductCategories(prev => [...prev, category]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<ProductCategory>) => {
    setProductCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setProductCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // ─── Closing text ───────────────────────────────
  const setClosingText = useCallback((text: string) => {
    setClosingTextState(text);
  }, []);

  // ─── Store name ─────────────────────────────────
  const setStoreName = useCallback((name: string) => {
    setStoreNameState(name);
  }, []);

  // ─── Resets ─────────────────────────────────────
  const resetAll = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
    setUpgradeProducts(DEFAULT_UPGRADE_PRODUCTS);
    setConditionDeductions(DEFAULT_CONDITION_DEDUCTIONS);
    setInstallmentRates(DEFAULT_INSTALLMENT_RATES);
    setProductCategories(DEFAULT_PRODUCT_CATEGORIES);
    setClosingTextState(DEFAULT_ORCAMENTO_CLOSING);
    setStoreNameState("");
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }, []);

  const resetProducts = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
    localStorage.removeItem(KEYS.products);
  }, []);

  const resetUpgradeProducts = useCallback(() => {
    setUpgradeProducts(DEFAULT_UPGRADE_PRODUCTS);
    localStorage.removeItem(KEYS.upgradeProducts);
  }, []);

  const resetDeductions = useCallback(() => {
    setConditionDeductions(DEFAULT_CONDITION_DEDUCTIONS);
    localStorage.removeItem(KEYS.deductions);
  }, []);

  const resetRates = useCallback(() => {
    setInstallmentRates(DEFAULT_INSTALLMENT_RATES);
    localStorage.removeItem(KEYS.rates);
  }, []);

  const value: ConfigContextType = {
    products,
    upgradeProducts,
    conditionDeductions,
    installmentRates,
    productCategories,
    closingText,
    storeName,
    addProduct,
    updateProduct,
    removeProduct,
    addUpgradeProduct,
    updateUpgradeProduct,
    removeUpgradeProduct,
    addDeduction,
    updateDeduction,
    removeDeduction,
    addRate,
    updateRate: updateRateFn,
    removeRate,
    addCategory,
    updateCategory,
    removeCategory,
    setClosingText,
    setStoreName,
    resetAll,
    resetProducts,
    resetUpgradeProducts,
    resetDeductions,
    resetRates,
    isSyncing,
    lastSyncError,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}
