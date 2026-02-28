/**
 * OrcamentoSummary — Resumo do orçamento com todos os cálculos
 * Design: Tech Workspace — card fixo com hierarquia visual clara
 */
import { Product, UpgradeProduct, formatCurrency } from "@/lib/data";
import { OrcamentoCalculations } from "@/hooks/useOrcamento";
import {
  Receipt,
  Smartphone,
  ArrowLeftRight,
  AlertTriangle,
  TrendingDown,
  CreditCard,
  RotateCcw,
  Banknote,
} from "lucide-react";

interface OrcamentoSummaryProps {
  selectedProduct: Product | null;
  selectedUpgrade: UpgradeProduct | null;
  calculations: OrcamentoCalculations;
  selectedInstallments: number;
  onReset: () => void;
}

export default function OrcamentoSummary({
  selectedProduct,
  selectedUpgrade,
  calculations,
  selectedInstallments,
  onReset,
}: OrcamentoSummaryProps) {
  const hasAnything = selectedProduct || selectedUpgrade;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Resumo do Orçamento</h2>
        </div>
        {hasAnything && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            Novo
          </button>
        )}
      </div>

      {!hasAnything ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Selecione um produto para começar o orçamento
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Produto selecionado */}
          {selectedProduct && (
            <div className="flex items-start justify-between py-2.5 border-b border-border">
              <div className="flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProduct.storage}</p>
                </div>
              </div>
              <span className="money-value text-sm text-foreground shrink-0">
                {formatCurrency(calculations.productPrice)}
              </span>
            </div>
          )}

          {/* Upgrade / Troca */}
          {selectedUpgrade && (
            <>
              <div className="flex items-start justify-between py-2.5 border-b border-border">
                <div className="flex items-start gap-2.5">
                  <ArrowLeftRight className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedUpgrade.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUpgrade.storage} — Avaliação</p>
                  </div>
                </div>
                <span className="money-value text-sm text-emerald shrink-0">
                  -{formatCurrency(calculations.upgradeValue)}
                </span>
              </div>

              {/* Abatimentos por condição */}
              {calculations.deductionDetails.length > 0 && (
                <div className="ml-6 space-y-1 border-l-2 border-destructive/20 pl-3">
                  {calculations.deductionDetails.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-destructive/70" />
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                      </div>
                      <span className="money-value text-xs text-destructive">
                        +{formatCurrency(d.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-dashed border-border">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Total abatimentos
                    </span>
                    <span className="money-value text-xs text-destructive font-bold">
                      +{formatCurrency(calculations.totalDeductions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3 text-emerald" />
                      <span className="text-xs font-semibold text-foreground">Valor líquido da troca</span>
                    </div>
                    <span className="money-value text-xs text-emerald font-bold">
                      -{formatCurrency(calculations.netUpgradeValue)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Separador forte */}
          <div className="border-t-2 border-foreground/15 my-1" />

          {/* Valor a pagar */}
          <div className="flex items-center justify-between py-2">
            <span className="text-base font-bold text-foreground">Valor a Pagar</span>
            <span className="money-value text-xl text-foreground">
              {formatCurrency(calculations.amountToPay)}
            </span>
          </div>

          {/* Parcelamento selecionado */}
          {selectedInstallments > 1 && calculations.amountToPay > 0 && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-base font-bold text-primary">
                  {selectedInstallments}x de{" "}
                  <span className="money-value">
                    {formatCurrency(calculations.installmentValue)}
                  </span>
                </span>
              </div>
              {calculations.installmentRate > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                  <span>Taxa: <strong>{calculations.installmentRate.toFixed(2)}%</strong></span>
                  <span>Juros: <strong className="text-destructive">{formatCurrency(calculations.interestAmount)}</strong></span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-primary/10">
                <span className="text-xs font-semibold text-foreground">Total com juros</span>
                <span className="money-value text-sm text-primary font-bold">
                  {formatCurrency(calculations.totalWithInterest)}
                </span>
              </div>
            </div>
          )}

          {/* À vista */}
          {selectedInstallments <= 1 && calculations.amountToPay > 0 && (
            <div className="bg-emerald-light border border-emerald/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-emerald" />
                <span className="text-sm font-bold text-emerald">
                  Pagamento à vista
                </span>
              </div>
              <p className="money-value text-2xl text-emerald">
                {formatCurrency(calculations.amountToPay)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
