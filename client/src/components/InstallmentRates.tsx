/**
 * InstallmentRates — Taxas de parcelamento editáveis + seleção de parcelas
 * Design: Tech Workspace — tabela editável, destaque na parcela selecionada
 */
import { useState } from "react";
import { InstallmentRate, formatCurrency } from "@/lib/data";
import { Percent, RotateCcw, Settings2, ChevronDown, ChevronUp, Info } from "lucide-react";

interface InstallmentRatesProps {
  rates: InstallmentRate[];
  selectedInstallments: number;
  onSelectInstallments: (n: number) => void;
  onUpdateRate: (installments: number, rate: number) => void;
  onResetRates: () => void;
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
  const [showAll, setShowAll] = useState(false);

  const displayedRates = showAll ? rates : rates.slice(0, 6);

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
            Edite as taxas de juros abaixo. As alterações são salvas automaticamente.
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

      {/* Tabela de parcelas */}
      <div className="space-y-1.5">
        {displayedRates.map((rate) => {
          const isSelected = selectedInstallments === rate.installments;
          const total = amountToPay + amountToPay * (rate.rate / 100);
          const parcela = rate.installments > 0 ? total / rate.installments : total;

          return (
            <div
              key={rate.installments}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isSelected
                  ? "bg-primary/8 border border-primary/25 shadow-sm"
                  : "bg-card border border-border hover:border-primary/20 hover:bg-accent/50"
              }`}
            >
              {/* Seleção */}
              <button
                onClick={() => onSelectInstallments(rate.installments)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </button>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {rate.installments === 1 ? "À Vista" : `${rate.installments}x`}
                  </span>
                  {rate.rate === 0 && rate.installments > 1 && (
                    <span className="badge-success px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Sem juros
                    </span>
                  )}
                </div>
              </div>

              {/* Taxa editável */}
              {editMode ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={rate.rate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        onUpdateRate(rate.installments, val);
                      }
                    }}
                    className="w-16 px-2 py-1.5 text-xs text-right font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-xs text-muted-foreground font-medium">%</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-mono">
                  {rate.rate > 0 ? `${rate.rate.toFixed(2)}%` : ""}
                </span>
              )}

              {/* Valor da parcela */}
              {amountToPay > 0 && (
                <div className="text-right shrink-0 min-w-[110px]">
                  <p className={`money-value text-sm ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                    {rate.installments === 1
                      ? formatCurrency(parcela)
                      : `${rate.installments}x ${formatCurrency(parcela)}`}
                  </p>
                  {rate.rate > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Total: {formatCurrency(total)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ver mais / menos */}
      {rates.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Ver todas ({rates.length} parcelas)
            </>
          )}
        </button>
      )}
    </div>
  );
}
