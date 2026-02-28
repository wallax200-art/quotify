import { useState, useCallback, useMemo } from "react";
import {
  type Product,
  type UpgradeProduct,
  type InstallmentRate,
  type ConditionDeduction,
  calcularParcela,
  calcularTotalParcelado,
} from "@/lib/data";

// Abatimento ativo com valor editável
export interface ActiveDeduction {
  id: string;
  value: number;
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
  selectedInstallments: number;
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
  totalDeductions: number;
  totalBonus: number;
  netDeductions: number;
  netUpgradeValue: number;
  amountToPay: number;
  installmentOptions: InstallmentDetail[];
  selectedDetail: InstallmentDetail | null;
  deductionDetails: { id: string; label: string; value: number; isBonus: boolean }[];
}

let customIdCounter = 0;

export function useOrcamento(
  conditionDeductions: ConditionDeduction[],
  installmentRates: InstallmentRate[],
) {
  const [state, setState] = useState<OrcamentoState>({
    selectedProduct: null,
    selectedUpgrade: null,
    activeDeductions: [],
    customDeductions: [],
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

  const toggleDeduction = useCallback((deductionId: string) => {
    setState((prev) => {
      const exists = prev.activeDeductions.find((d) => d.id === deductionId);
      if (exists) {
        return {
          ...prev,
          activeDeductions: prev.activeDeductions.filter((d) => d.id !== deductionId),
        };
      }
      const def = conditionDeductions.find((cd: ConditionDeduction) => cd.id === deductionId);
      if (!def) return prev;
      return {
        ...prev,
        activeDeductions: [...prev.activeDeductions, { id: deductionId, value: def.defaultValue }],
      };
    });
  }, [conditionDeductions]);

  const updateDeductionValue = useCallback((deductionId: string, newValue: number) => {
    setState((prev) => ({
      ...prev,
      activeDeductions: prev.activeDeductions.map((d) =>
        d.id === deductionId ? { ...d, value: newValue } : d
      ),
    }));
  }, []);

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

  const removeCustomDeduction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customDeductions: prev.customDeductions.filter((d) => d.id !== id),
    }));
  }, []);

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

  const resetAll = useCallback(() => {
    setState({
      selectedProduct: null,
      selectedUpgrade: null,
      activeDeductions: [],
      customDeductions: [],
      selectedInstallments: 0,
    });
  }, []);

  // --- Cálculos ---
  const calculations = useMemo<OrcamentoCalculations>(() => {
    const productPrice = state.selectedProduct?.price ?? 0;
    const upgradeValue = state.selectedUpgrade?.tradeInValue ?? 0;

    const deductionDetails: { id: string; label: string; value: number; isBonus: boolean }[] = [];

    for (const active of state.activeDeductions) {
      const def = conditionDeductions.find((cd: ConditionDeduction) => cd.id === active.id);
      if (def) {
        deductionDetails.push({
          id: active.id,
          label: def.label,
          value: active.value,
          isBonus: def.defaultValue < 0,
        });
      }
    }

    for (const custom of state.customDeductions) {
      deductionDetails.push({
        id: custom.id,
        label: custom.label,
        value: custom.value,
        isBonus: false,
      });
    }

    const totalDeductions = deductionDetails
      .filter((d) => !d.isBonus)
      .reduce((sum, d) => sum + Math.abs(d.value), 0);
    const totalBonus = deductionDetails
      .filter((d) => d.isBonus)
      .reduce((sum, d) => sum + Math.abs(d.value), 0);
    const netDeductions = totalDeductions - totalBonus;

    const netUpgradeValue = Math.max(0, upgradeValue - netDeductions);
    const amountToPay = Math.max(0, productPrice - netUpgradeValue);

    const installmentOptions: InstallmentDetail[] = installmentRates.map((r) => {
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
  }, [state, conditionDeductions, installmentRates]);

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
    resetAll,
  };
}
