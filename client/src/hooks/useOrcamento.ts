import { useState, useCallback, useMemo } from "react";
import {
  Product,
  UpgradeProduct,
  ConditionDeduction,
  InstallmentRate,
  DEFAULT_INSTALLMENT_RATES,
  CONDITION_DEDUCTIONS,
} from "@/lib/data";

export interface OrcamentoState {
  // Produto selecionado para compra
  selectedProduct: Product | null;
  // Produto de upgrade (troca) do cliente
  selectedUpgrade: UpgradeProduct | null;
  // Abatimentos por condição do aparelho de upgrade
  selectedDeductions: string[];
  // Taxas de parcelamento (editáveis)
  installmentRates: InstallmentRate[];
  // Parcelas selecionadas
  selectedInstallments: number;
}

export interface OrcamentoCalculations {
  // Valor do produto novo
  productPrice: number;
  // Valor de avaliação do upgrade
  upgradeValue: number;
  // Total de abatimentos por condição
  totalDeductions: number;
  // Valor líquido do upgrade (após abatimentos por condição)
  netUpgradeValue: number;
  // Valor a pagar (produto - upgrade líquido)
  amountToPay: number;
  // Taxa de parcelamento aplicada
  installmentRate: number;
  // Valor total com juros
  totalWithInterest: number;
  // Valor de cada parcela
  installmentValue: number;
  // Valor dos juros
  interestAmount: number;
  // Detalhes dos abatimentos
  deductionDetails: { label: string; value: number }[];
}

const STORAGE_KEY = "orcamento-loja-rates";

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
    selectedInstallments: 1,
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
    saveRates(defaults);
    setState((prev) => ({ ...prev, installmentRates: defaults }));
  }, []);

  const resetAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedProduct: null,
      selectedUpgrade: null,
      selectedDeductions: [],
      selectedInstallments: 1,
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

    // Valor a pagar
    const amountToPay = Math.max(0, productPrice - netUpgradeValue);

    // Taxa de parcelamento
    const rateObj = state.installmentRates.find(
      (r) => r.installments === state.selectedInstallments
    );
    const installmentRate = rateObj?.rate ?? 0;

    // Valor total com juros
    const interestAmount = amountToPay * (installmentRate / 100);
    const totalWithInterest = amountToPay + interestAmount;

    // Valor da parcela
    const installmentValue =
      state.selectedInstallments > 0
        ? totalWithInterest / state.selectedInstallments
        : totalWithInterest;

    return {
      productPrice,
      upgradeValue,
      totalDeductions,
      netUpgradeValue,
      deductionDetails,
      amountToPay,
      installmentRate,
      totalWithInterest,
      installmentValue,
      interestAmount,
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
