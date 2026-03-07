/**
 * OrcamentoSummary — Resumo do orçamento Quotify Imports
 * Mostra resumo + botão para gerar texto formatado para WhatsApp
 * + Botão para gerar PDF do orçamento
 * + Botão para gerar Termo de Garantia PDF
 */
import { useState } from "react";
import { Product, UpgradeProduct, InstallmentRate, formatCurrency, gerarOrcamentoTexto } from "@/lib/data";
import { OrcamentoCalculations } from "@/hooks/useOrcamento";
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { generateWarrantyPdf, getDefaultWarrantyText } from "@/lib/generateWarrantyPdf";
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
  FileText,
  Shield,
  X,
  User,
  Phone,
} from "lucide-react";

interface OrcamentoSummaryProps {
  selectedProduct: Product | null;
  selectedUpgrade: UpgradeProduct | null;
  calculations: OrcamentoCalculations;
  selectedInstallments: number;
  installmentRates: InstallmentRate[];
  closingText: string;
  storeName?: string;
  logoBase64?: string | null;
  warrantyText?: string;
  warrantyDays?: number;
  sellerName?: string;
  onReset: () => void;
}

export default function OrcamentoSummary({
  selectedProduct,
  selectedUpgrade,
  calculations,
  selectedInstallments,
  installmentRates,
  closingText,
  storeName,
  logoBase64,
  warrantyText,
  warrantyDays = 90,
  sellerName,
  onReset,
}: OrcamentoSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [showOrcamento, setShowOrcamento] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pdfTarget, setPdfTarget] = useState<"quote" | "warranty" | null>(null);
  const hasAnything = selectedProduct || selectedUpgrade;

  const handleCopyOrcamento = () => {
    if (!selectedProduct) return;
    const texto = gerarOrcamentoTexto(
      selectedProduct,
      selectedUpgrade,
      calculations.amountToPay,
      installmentRates,
      closingText,
      storeName,
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
      installmentRates,
      closingText,
      storeName,
    );
    const encoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const openCustomerModal = (target: "quote" | "warranty") => {
    setPdfTarget(target);
    setShowWarrantyModal(true);
  };

  const handleGeneratePdf = () => {
    if (!selectedProduct) return;
    setShowWarrantyModal(false);

    if (pdfTarget === "quote") {
      generateQuotePdf({
        product: selectedProduct,
        upgrade: selectedUpgrade,
        amountToPay: calculations.amountToPay,
        rates: installmentRates,
        closingText,
        storeName: storeName || "Quotify",
        logoBase64,
        deductions: calculations.deductionDetails.map((d) => ({
          label: d.label,
          value: d.value,
        })),
        customerName: customerName || undefined,
      });
    } else if (pdfTarget === "warranty") {
      generateWarrantyPdf({
        product: selectedProduct,
        storeName: storeName || "Quotify",
        logoBase64,
        warrantyText: warrantyText || getDefaultWarrantyText(),
        warrantyDays,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        sellerName,
      });
    }
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
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.storage !== "-" && selectedProduct.storage}
                    {selectedProduct.color && ` • ${selectedProduct.color}`}
                    {selectedProduct.specs && ` • ${selectedProduct.specs}`}
                    {" • "}
                    {selectedProduct.condition === "novo" ? "Lacrado" : "Seminovo"}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-foreground shrink-0">
                {selectedProduct.price > 0 ? formatCurrency(calculations.productPrice) : "A definir"}
              </span>
            </div>
          )}

          {/* Upgrade / Troca */}
          {selectedUpgrade && (
            <>
              <div className="flex items-start justify-between py-2.5 border-b border-border">
                <div className="flex items-start gap-2.5">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedUpgrade.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUpgrade.storage} — Avaliação</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-600 shrink-0">
                  -{formatCurrency(calculations.upgradeValue)}
                </span>
              </div>

              {/* Abatimentos por condição */}
              {calculations.deductionDetails.length > 0 && (
                <div className="ml-6 space-y-1 border-l-2 border-destructive/20 pl-3">
                  {calculations.deductionDetails.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3 h-3 ${d.isBonus ? "text-emerald-600/70" : "text-destructive/70"}`} />
                        <span className="text-xs text-muted-foreground">{d.label}</span>
                      </div>
                      <span className={`font-mono text-xs font-semibold ${d.isBonus ? "text-emerald-600" : "text-destructive"}`}>
                        {d.isBonus ? "-" : "+"}{formatCurrency(Math.abs(d.value))}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-dashed border-border">
                    <span className="text-xs font-semibold text-muted-foreground">Total abatimentos</span>
                    <span className="font-mono text-xs text-destructive font-bold">+{formatCurrency(calculations.netDeductions)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-foreground">Valor líquido da troca</span>
                    </div>
                    <span className="font-mono text-xs text-emerald-600 font-bold">-{formatCurrency(calculations.netUpgradeValue)}</span>
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
            <span className="font-mono text-xl font-bold text-foreground">
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
                  <span className="font-mono">{formatCurrency(calculations.selectedDetail.parcela)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-background/60 rounded-lg px-3 py-2">
                <span>Taxa: <strong>{(calculations.selectedDetail.rate * 100).toFixed(3)}%</strong></span>
                <span>Juros: <strong className="text-destructive">{formatCurrency(calculations.selectedDetail.total - calculations.amountToPay)}</strong></span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-primary/10">
                <span className="text-xs font-semibold text-foreground">Total parcelado</span>
                <span className="font-mono text-sm text-primary font-bold">{formatCurrency(calculations.selectedDetail.total)}</span>
              </div>
            </div>
          )}

          {/* À vista selecionado */}
          {selectedInstallments === 0 && calculations.amountToPay > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">Pagamento à vista no PIX</span>
              </div>
              <p className="font-mono text-2xl font-bold text-emerald-600">
                {formatCurrency(calculations.amountToPay)}
              </p>
            </div>
          )}

          {/* Todas as opções de parcelamento */}
          {calculations.amountToPay > 0 && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                Simulação completa
              </p>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground">PIX à vista</span>
                <span className="font-mono text-xs text-foreground font-semibold">{formatCurrency(calculations.amountToPay)}</span>
              </div>
              {calculations.installmentOptions.map((opt) => (
                <div key={opt.installments} className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">{opt.installments}x</span>
                  <span className="font-mono text-xs text-foreground font-semibold">{opt.installments}x {formatCurrency(opt.parcela)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Botões de ação */}
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
                  <div className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {gerarOrcamentoTexto(
                      selectedProduct,
                      selectedUpgrade,
                      calculations.amountToPay,
                      installmentRates,
                      closingText,
                      storeName,
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyOrcamento}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-accent active:scale-[0.98] transition-all"
                    >
                      {copied ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copiar</>
                      )}
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#22c55e] active:scale-[0.98] transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de PDF */}
              <div className="flex gap-2">
                <button
                  onClick={() => openCustomerModal("quote")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Orçamento
                </button>
                <button
                  onClick={() => openCustomerModal("warranty")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 active:scale-[0.98] transition-all"
                >
                  <Shield className="w-3.5 h-3.5" /> Termo Garantia
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de dados do cliente para PDF */}
      {showWarrantyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {pdfTarget === "quote" ? (
                  <FileText className="w-5 h-5 text-blue-600" />
                ) : (
                  <Shield className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="text-base font-bold text-foreground">
                  {pdfTarget === "quote" ? "Gerar PDF do Orçamento" : "Gerar Termo de Garantia"}
                </h3>
              </div>
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Informe os dados do cliente (opcional). O PDF será gerado com as informações do orçamento atual.
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {pdfTarget === "warranty" && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="Telefone do cliente"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
              </div>

              {pdfTarget === "warranty" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Garantia:</strong> {warrantyDays} dias a partir de hoje.
                    {warrantyText ? " Texto personalizado configurado." : " Texto padrão será utilizado."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleGeneratePdf}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all ${
                  pdfTarget === "quote"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
