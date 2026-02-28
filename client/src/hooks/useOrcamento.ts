import { useState, useCallback, useMemo } from "react";
import {
  Product,
  UpgradeProduct,
  InstallmentRate,
  DEFAULT_INSTALLMENT_RATES,
  CONDITION_DEDUCTIONS,
  calcularParcela,
  calcularTotalParcelado,
} from "@/lib/data";

// Abatimento ativo com valor editável
export interface ActiveDeduction {
  id: string;
  value: number; // valor atual (pode ser editado pelo vendedor)
}

// "Outros" — abatimento livre definido pelo vendedor
export interface CustomDeduction {
  id: string;
  label: string;
  value: number;
}

export interface OrcamentoState {
  selectedProduct: Product | null;
  selectedUpgrade: UpgradeProduct | null;
  activeDeductions: ActiveDeduction[];
  customDeductions: CustomDeduction[];
  installmentRates: InstallmentRate[];
  selectedInstallments: number; // 0 = à vista PIX, ou 8/10/12/18
}

export interface InstallmentDetail {
  installments: number;
  rate: number;
  parcela: number;
  total: number;
  label: string;
}

export interface OrcamentoCalculations {
  productPrice: number;
  upgradeValue: number;
  totalDeductions: number; // total de abatimentos (positivo = desconta do upgrade)
  totalBonus: number; // total de bônus (garantia apple, etc.)
  netDeductions: number; // totalDeductions - totalBonus
  netUpgradeValue: number;
  amountToPay: number;
  installmentOptions: InstallmentDetail[];
  selectedDetail: InstallmentDetail | null;
  deductionDetails: { id: string; label: string; value: number; isBonus: boolean }[];
}

const STORAGE_KEY = "tiosam-rates-v2";

function loadSavedRates(): InstallmentRate[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveRates(rates: InstallmentRate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch { /* ignore */ }
}

let customIdCounter = 0;

export function useOrcamento() {
  const [state, setState] = useState<OrcamentoState>({
    selectedProduct: null,
    selectedUpgrade: null,
    activeDeductions: [],
    customDeductions: [],
    installmentRates: loadSavedRates() || DEFAULT_INSTALLMENT_RATES.map((r) => ({ ...r })),
    selectedInstallments: 0,
  });

  // --- Ações ---
  const selectProduct = useCallback((product: Product | null) => {
    setState((prev) => ({ ...prev, selectedProduct: product }));
  }, []);

  const selectUpgrade = useCallback((upgrade: UpgradeProduct | null) => {
    setState((prev) => ({
      ...prev,
      selectedUpgrade: upgrade,
      activeDeductions: upgrade ? prev.activeDeductions : [],
      customDeductions: upgrade ? prev.customDeductions : [],
    }));
  }, []);

  // Toggle um abatimento padrão (ativa/desativa)
  const toggleDeduction = useCallback((deductionId: string) => {
    setState((prev) => {
      const exists = prev.activeDeductions.find((d) => d.id === deductionId);
      if (exists) {
        return {
          ...prev,
          activeDeductions: prev.activeDeductions.filter((d) => d.id !== deductionId),
        };
      }
      // Ativar com valor padrão
      const def = CONDITION_DEDUCTIONS.find((cd) => cd.id === deductionId);
      if (!def) return prev;
      return {
        ...prev,
        activeDeductions: [...prev.activeDeductions, { id: deductionId, value: def.defaultValue }],
      };
    });
  }, []);

  // Editar valor de um abatimento ativo
  const updateDeductionValue = useCallback((deductionId: string, newValue: number) => {
    setState((prev) => ({
      ...prev,
      activeDeductions: prev.activeDeductions.map((d) =>
        d.id === deductionId ? { ...d, value: newValue } : d
      ),
    }));
  }, []);

  // Adicionar abatimento personalizado (Outros)
  const addCustomDeduction = useCallback((label: string, value: number) => {
    customIdCounter++;
    const newCustom: CustomDeduction = {
      id: `custom-${Date.now()}-${customIdCounter}`,
      label: label || "Outro abatimento",
      value,
    };
    setState((prev) => ({
      ...prev,
      customDeductions: [...prev.customDeductions, newCustom],
    }));
  }, []);

  // Remover abatimento personalizado
  const removeCustomDeduction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customDeductions: prev.customDeductions.filter((d) => d.id !== id),
    }));
  }, []);

  // Editar valor de abatimento personalizado
  const updateCustomDeduction = useCallback((id: string, label: string, value: number) => {
    setState((prev) => ({
      ...prev,
      customDeductions: prev.customDeductions.map((d) =>
        d.id === id ? { ...d, label, value } : d
      ),
    }));
  }, []);

  const setInstallments = useCallback((installments: number) => {
    setState((prev) => ({ ...prev, selectedInstallments: installments }));
  }, []);

  const updateRate = useCallback((installments: number, newRate: number) => {
    setState((prev) => {
      const updated = prev.installmentRates.map((r) =>
        r.installments === installments ? { ...r, rate: newRate } : r
      );
      saveRates(updated);
      return { ...prev, installmentRates: updated };
    });
  }, []);

  const resetRates = useCallback(() => {
    const defaults = DEFAULT_INSTALLMENT_RATES.map((r) => ({ ...r }));
    localStorage.removeItem(STORAGE_KEY);
    saveRates(defaults);
    setState((prev) => ({ ...prev, installmentRates: defaults }));
  }, []);

  const resetAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedProduct: null,
      selectedUpgrade: null,
      activeDeductions: [],
      customDeductions: [],
      selectedInstallments: 0,
    }));
  }, []);

  // --- Cálculos ---
  const calculations = useMemo<OrcamentoCalculations>(() => {
    const productPrice = state.selectedProduct?.price ?? 0;
    const upgradeValue = state.selectedUpgrade?.tradeInValue ?? 0;

    // Montar detalhes dos abatimentos
    const deductionDetails: { id: string; label: string; value: number; isBonus: boolean }[] = [];

    // Abatimentos padrão ativos
    for (const active of state.activeDeductions) {
      const def = CONDITION_DEDUCTIONS.find((cd) => cd.id === active.id);
      if (def) {
        deductionDetails.push({
          id: active.id,
          label: def.label,
          value: active.value,
          isBonus: def.defaultValue < 0, // garantia apple = bônus
        });
      }
    }

    // Abatimentos personalizados
    for (const custom of state.customDeductions) {
      deductionDetails.push({
        id: custom.id,
        label: custom.label,
        value: custom.value,
        isBonus: false,
      });
    }

    // Separar abatimentos e bônus
    const totalDeductions = deductionDetails
      .filter((d) => !d.isBonus)
      .reduce((sum, d) => sum + Math.abs(d.value), 0);
    const totalBonus = deductionDetails
      .filter((d) => d.isBonus)
      .reduce((sum, d) => sum + Math.abs(d.value), 0);
    const netDeductions = totalDeductions - totalBonus;

    // Valor líquido do upgrade
    const netUpgradeValue = Math.max(0, upgradeValue - netDeductions);

    // Valor a pagar (à vista no PIX — base real)
    const amountToPay = Math.max(0, productPrice - netUpgradeValue);

    // Calcular TODAS as opções de parcelamento
    const installmentOptions: InstallmentDetail[] = state.installmentRates.map((r) => {
      const parcela = calcularParcela(amountToPay, r.rate, r.installments);
      const total = calcularTotalParcelado(amountToPay, r.rate, r.installments);
      return { installments: r.installments, rate: r.rate, parcela, total, label: r.label };
    });

    const selectedDetail = state.selectedInstallments > 0
      ? installmentOptions.find((o) => o.installments === state.selectedInstallments) || null
      : null;

    return {
      productPrice,
      upgradeValue,
      totalDeductions,
      totalBonus,
      netDeductions,
      netUpgradeValue,
      deductionDetails,
      amountToPay,
      installmentOptions,
      selectedDetail,
    };
  }, [state]);

  return {
    state,
    calculations,
    selectProduct,
    selectUpgrade,
    toggleDeduction,
    updateDeductionValue,
    addCustomDeduction,
    removeCustomDeduction,
    updateCustomDeduction,
    setInstallments,
    updateRate,
    resetRates,
    resetAll,
  };
}
