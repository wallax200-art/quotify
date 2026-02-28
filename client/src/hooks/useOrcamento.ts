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

export interface OrcamentoState {
  selectedProduct: Product | null;
  selectedUpgrade: UpgradeProduct | null;
  selectedDeductions: string[];
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
  totalDeductions: number;
  netUpgradeValue: number;
  amountToPay: number; // valor à vista no PIX (base real)
  // Todas as opções de parcelamento calculadas
  installmentOptions: InstallmentDetail[];
  // Parcela selecionada (se houver)
  selectedDetail: InstallmentDetail | null;
  // Detalhes dos abatimentos
  deductionDetails: { label: string; value: number }[];
}

const STORAGE_KEY = "tiosam-rates-v2";

function loadSavedRates(): InstallmentRate[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return null;
}

function saveRates(rates: InstallmentRate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch {
    // ignore
  }
}

export function useOrcamento() {
  const [state, setState] = useState<OrcamentoState>({
    selectedProduct: null,
    selectedUpgrade: null,
    selectedDeductions: [],
    installmentRates: loadSavedRates() || DEFAULT_INSTALLMENT_RATES.map((r) => ({ ...r })),
    selectedInstallments: 0, // 0 = à vista PIX
  });

  // --- Ações ---
  const selectProduct = useCallback((product: Product | null) => {
    setState((prev) => ({ ...prev, selectedProduct: product }));
  }, []);

  const selectUpgrade = useCallback((upgrade: UpgradeProduct | null) => {
    setState((prev) => ({
      ...prev,
      selectedUpgrade: upgrade,
      selectedDeductions: upgrade ? prev.selectedDeductions : [],
    }));
  }, []);

  const toggleDeduction = useCallback((deductionId: string) => {
    setState((prev) => {
      const exists = prev.selectedDeductions.includes(deductionId);
      return {
        ...prev,
        selectedDeductions: exists
          ? prev.selectedDeductions.filter((id) => id !== deductionId)
          : [...prev.selectedDeductions, deductionId],
      };
    });
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
      selectedDeductions: [],
      selectedInstallments: 0,
    }));
  }, []);

  // --- Cálculos ---
  const calculations = useMemo<OrcamentoCalculations>(() => {
    const productPrice = state.selectedProduct?.price ?? 0;
    const upgradeValue = state.selectedUpgrade?.tradeInValue ?? 0;

    // Calcular abatimentos por condição
    const deductionDetails = state.selectedDeductions.map((id) => {
      const d = CONDITION_DEDUCTIONS.find((cd) => cd.id === id);
      return { label: d?.label ?? "", value: d?.deductionValue ?? 0 };
    });
    const totalDeductions = deductionDetails.reduce((sum, d) => sum + d.value, 0);

    // Valor líquido do upgrade
    const netUpgradeValue = Math.max(0, upgradeValue - totalDeductions);

    // Valor a pagar (à vista no PIX — base real)
    const amountToPay = Math.max(0, productPrice - netUpgradeValue);

    // Calcular TODAS as opções de parcelamento com a fórmula exata
    // Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
    const installmentOptions: InstallmentDetail[] = state.installmentRates.map((r) => {
      const parcela = calcularParcela(amountToPay, r.rate, r.installments);
      const total = calcularTotalParcelado(amountToPay, r.rate, r.installments);
      return {
        installments: r.installments,
        rate: r.rate,
        parcela,
        total,
        label: r.label,
      };
    });

    // Detalhe da parcela selecionada
    const selectedDetail = state.selectedInstallments > 0
      ? installmentOptions.find((o) => o.installments === state.selectedInstallments) || null
      : null;

    return {
      productPrice,
      upgradeValue,
      totalDeductions,
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
    setInstallments,
    updateRate,
    resetRates,
    resetAll,
  };
}
