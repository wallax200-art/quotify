import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
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

// --- Storage Keys ---
const KEYS = {
  products: "tiosam-products-v3",
  upgradeProducts: "tiosam-upgrade-v3",
  deductions: "tiosam-deductions-v3",
  rates: "tiosam-rates-v3",
  categories: "tiosam-categories-v3",
  closingText: "tiosam-closing-v3",
} as const;

// --- Config State ---
interface ConfigState {
  products: Product[];
  upgradeProducts: UpgradeProduct[];
  conditionDeductions: ConditionDeduction[];
  installmentRates: InstallmentRate[];
  productCategories: ProductCategory[];
  closingText: string;
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
  // Reset
  resetAll: () => void;
  resetProducts: () => void;
  resetUpgradeProducts: () => void;
  resetDeductions: () => void;
  resetRates: () => void;
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

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage(KEYS.products, DEFAULT_PRODUCTS)
  );
  const [upgradeProducts, setUpgradeProducts] = useState<UpgradeProduct[]>(() =>
    loadFromStorage(KEYS.upgradeProducts, DEFAULT_UPGRADE_PRODUCTS)
  );
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

  // Auto-save on changes
  useEffect(() => { saveToStorage(KEYS.products, products); }, [products]);
  useEffect(() => { saveToStorage(KEYS.upgradeProducts, upgradeProducts); }, [upgradeProducts]);
  useEffect(() => { saveToStorage(KEYS.deductions, conditionDeductions); }, [conditionDeductions]);
  useEffect(() => { saveToStorage(KEYS.rates, installmentRates); }, [installmentRates]);
  useEffect(() => { saveToStorage(KEYS.categories, productCategories); }, [productCategories]);
  useEffect(() => { saveToStorage(KEYS.closingText, closingText); }, [closingText]);

  // --- Products ---
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // --- Upgrade Products ---
  const addUpgradeProduct = useCallback((product: UpgradeProduct) => {
    setUpgradeProducts(prev => [...prev, product]);
  }, []);

  const updateUpgradeProduct = useCallback((id: string, updates: Partial<UpgradeProduct>) => {
    setUpgradeProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeUpgradeProduct = useCallback((id: string) => {
    setUpgradeProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // --- Deductions ---
  const addDeduction = useCallback((deduction: ConditionDeduction) => {
    setConditionDeductions(prev => [...prev, deduction]);
  }, []);

  const updateDeduction = useCallback((id: string, updates: Partial<ConditionDeduction>) => {
    setConditionDeductions(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const removeDeduction = useCallback((id: string) => {
    setConditionDeductions(prev => prev.filter(d => d.id !== id));
  }, []);

  // --- Rates ---
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

  // --- Categories ---
  const addCategory = useCallback((category: ProductCategory) => {
    setProductCategories(prev => [...prev, category]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<ProductCategory>) => {
    setProductCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setProductCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- Closing text ---
  const setClosingText = useCallback((text: string) => {
    setClosingTextState(text);
  }, []);

  // --- Resets ---
  const resetAll = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
    setUpgradeProducts(DEFAULT_UPGRADE_PRODUCTS);
    setConditionDeductions(DEFAULT_CONDITION_DEDUCTIONS);
    setInstallmentRates(DEFAULT_INSTALLMENT_RATES);
    setProductCategories(DEFAULT_PRODUCT_CATEGORIES);
    setClosingTextState(DEFAULT_ORCAMENTO_CLOSING);
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
    resetAll,
    resetProducts,
    resetUpgradeProducts,
    resetDeductions,
    resetRates,
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
