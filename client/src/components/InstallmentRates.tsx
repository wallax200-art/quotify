/**
 * InstallmentRates — Taxas de parcelamento Tio Sam Imports
 * Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
 * Taxas FIXAS: 8x=9,630% | 10x=10,760% | 12x=11,880% | 18x=17,000%
 * Taxas são editáveis pelo dono da loja
 */
import { useState } from "react";
import { InstallmentRate, formatCurrency, calcularParcela, calcularTotalParcelado } from "@/lib/data";
import { Percent, RotateCcw, Settings2, Info, Banknote, CreditCard } from "lucide-react";

interface InstallmentRatesProps {
  rates: InstallmentRate[];
  selectedInstallments: number;
  onSelectInstallments: (n: number) => void;
  onUpdateRate?: (installments: number, rate: number) => void;
  onResetRates?: () => void;
  amountToPay: number;
}

export default function InstallmentRates({
  rates,
  selectedInstallments,
  onSelectInstallments,
  onUpdateRate,
  onResetRates,
  amountToPay,
}: InstallmentRatesProps) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Percent className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Parcelamento</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              editMode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <Settings2 className="w-3 h-3" />
            {editMode ? "Fechar" : "Editar Taxas"}
          </button>
          {editMode && (
            <button
              onClick={onResetRates}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-accent transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Resetar
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Edite as taxas abaixo. Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ parcelas. Alterações salvas automaticamente.
          </p>
        </div>
      )}

      {amountToPay <= 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Selecione um produto na aba <strong>Produto</strong> para ver as opções de parcelamento.
          </p>
        </div>
      )}

      {/* Opção À Vista PIX */}
      <div className="space-y-2">
        <div
          onClick={() => onSelectInstallments(0)}
          className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all cursor-pointer ${
            selectedInstallments === 0
              ? "bg-emerald-light border-2 border-emerald/30 shadow-sm"
              : "bg-card border border-border hover:border-emerald/20 hover:bg-accent/50"
          }`}
        >
          <button
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              selectedInstallments === 0
                ? "border-emerald bg-emerald"
                : "border-border hover:border-emerald/50"
            }`}
          >
            {selectedInstallments === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <Banknote className={`w-4 h-4 ${selectedInstallments === 0 ? "text-emerald" : "text-muted-foreground"}`} />
            <span className={`text-sm font-bold ${selectedInstallments === 0 ? "text-emerald" : "text-foreground"}`}>
              À Vista no PIX
            </span>
          </div>

          {amountToPay > 0 && (
            <span className={`money-value text-base font-bold ${selectedInstallments === 0 ? "text-emerald" : "text-foreground"}`}>
              {formatCurrency(amountToPay)}
            </span>
          )}
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Cartão</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Opções de parcelamento */}
        {rates.map((rate) => {
          const isSelected = selectedInstallments === rate.installments;
          const parcela = amountToPay > 0 ? calcularParcela(amountToPay, rate.rate, rate.installments) : 0;
          const total = amountToPay > 0 ? calcularTotalParcelado(amountToPay, rate.rate, rate.installments) : 0;
          const ratePercent = (rate.rate * 100).toFixed(2);

          return (
            <div
              key={rate.installments}
              onClick={() => onSelectInstallments(rate.installments)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary/8 border-2 border-primary/25 shadow-sm"
                  : "bg-card border border-border hover:border-primary/20 hover:bg-accent/50"
              }`}
            >
              {/* Radio */}
              <button
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </button>

              {/* Label */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CreditCard className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {rate.installments}x
                </span>
              </div>

              {/* Taxa editável */}
              {editMode ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={rate.rate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val < 1) {
                        onUpdateRate?.(rate.installments, val);
                      }
                    }}
                    className="w-20 px-2 py-1.5 text-xs text-right font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground font-medium w-12">
                    ({ratePercent}%)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-mono">
                  {ratePercent}%
                </span>
              )}

              {/* Valor da parcela */}
              {amountToPay > 0 && (
                <div className="text-right shrink-0 min-w-[120px]">
                  <p className={`money-value text-sm ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                    {rate.installments}x {formatCurrency(parcela)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Total: {formatCurrency(total)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
