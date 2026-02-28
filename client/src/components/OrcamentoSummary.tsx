/**
 * OrcamentoSummary — Resumo do orçamento Tio Sam Imports
 * Mostra resumo + botão para gerar texto formatado para WhatsApp
 * Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
 */
import { useState } from "react";
import { Product, UpgradeProduct, formatCurrency, gerarOrcamentoTexto } from "@/lib/data";
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
  Copy,
  Check,
  MessageCircle,
  Share2,
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
  const [copied, setCopied] = useState(false);
  const [showOrcamento, setShowOrcamento] = useState(false);
  const hasAnything = selectedProduct || selectedUpgrade;

  const handleCopyOrcamento = () => {
    if (!selectedProduct) return;
    const texto = gerarOrcamentoTexto(
      selectedProduct,
      selectedUpgrade,
      calculations.amountToPay,
    );
    navigator.clipboard.writeText(texto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!selectedProduct) return;
    const texto = gerarOrcamentoTexto(
      selectedProduct,
      selectedUpgrade,
      calculations.amountToPay,
    );
    const encoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

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

          {/* Valor à vista PIX */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-base font-bold text-foreground">À Vista no PIX</span>
              <p className="text-[10px] text-muted-foreground">(base real)</p>
            </div>
            <span className="money-value text-xl text-foreground">
              {formatCurrency(calculations.amountToPay)}
            </span>
          </div>

          {/* Parcelamento selecionado */}
          {selectedInstallments > 0 && calculations.selectedDetail && calculations.amountToPay > 0 && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-base font-bold text-primary">
                  {calculations.selectedDetail.installments}x de{" "}
                  <span className="money-value">
                    {formatCurrency(calculations.selectedDetail.parcela)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                <span>Taxa: <strong>{(calculations.selectedDetail.rate * 100).toFixed(2)}%</strong></span>
                <span>Juros: <strong className="text-destructive">{formatCurrency(calculations.selectedDetail.total - calculations.amountToPay)}</strong></span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-primary/10">
                <span className="text-xs font-semibold text-foreground">Total parcelado</span>
                <span className="money-value text-sm text-primary font-bold">
                  {formatCurrency(calculations.selectedDetail.total)}
                </span>
              </div>
            </div>
          )}

          {/* À vista selecionado */}
          {selectedInstallments === 0 && calculations.amountToPay > 0 && (
            <div className="bg-emerald-light border border-emerald/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-emerald" />
                <span className="text-sm font-bold text-emerald">
                  Pagamento à vista no PIX
                </span>
              </div>
              <p className="money-value text-2xl text-emerald">
                {formatCurrency(calculations.amountToPay)}
              </p>
            </div>
          )}

          {/* Todas as opções de parcelamento (resumo compacto) */}
          {calculations.amountToPay > 0 && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                Simulação completa
              </p>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground">PIX à vista</span>
                <span className="money-value text-xs text-foreground font-semibold">
                  {formatCurrency(calculations.amountToPay)}
                </span>
              </div>
              {calculations.installmentOptions.map((opt) => (
                <div key={opt.installments} className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">
                    {opt.installments}x
                  </span>
                  <span className="money-value text-xs text-foreground font-semibold">
                    {opt.installments}x {formatCurrency(opt.parcela)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Botões de ação — Gerar orçamento */}
          {selectedProduct && calculations.amountToPay > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <button
                onClick={() => setShowOrcamento(!showOrcamento)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Share2 className="w-4 h-4" />
                {showOrcamento ? "Fechar Orçamento" : "Gerar Orçamento"}
              </button>

              {showOrcamento && (
                <div className="space-y-2">
                  {/* Preview do texto */}
                  <div className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {gerarOrcamentoTexto(
                      selectedProduct,
                      selectedUpgrade,
                      calculations.amountToPay,
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyOrcamento}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-accent active:scale-[0.98] transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#22c55e] active:scale-[0.98] transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
