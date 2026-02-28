/**
 * ConditionDeductions — Abatimentos por condição do aparelho de troca
 * Conforme Manual Interno de Compra e Upgrade — Tio Sam Imports
 * Valores EDITÁVEIS + opção "Outros" com campo livre
 */
import { useState } from "react";
import { CONDITION_DEDUCTIONS, formatCurrency } from "@/lib/data";
import { ActiveDeduction, CustomDeduction } from "@/hooks/useOrcamento";
import {
  Sparkles,
  ShieldAlert,
  ShieldX,
  BatteryMedium,
  BatteryLow,
  ScanFace,
  Sun,
  Monitor,
  MonitorX,
  Smartphone,
  Camera,
  VolumeX,
  WifiOff,
  ShieldCheck,
  AlertTriangle,
  Info,
  Pencil,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";

interface ConditionDeductionsProps {
  activeDeductions: ActiveDeduction[];
  customDeductions: CustomDeduction[];
  onToggle: (id: string) => void;
  onUpdateValue: (id: string, value: number) => void;
  onAddCustom: (label: string, value: number) => void;
  onRemoveCustom: (id: string) => void;
  onUpdateCustom: (id: string, label: string, value: number) => void;
  disabled?: boolean;
  totalDeductions: number;
  totalBonus: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  "shield-alert": ShieldAlert,
  "shield-x": ShieldX,
  "battery-medium": BatteryMedium,
  "battery-low": BatteryLow,
  "scan-face": ScanFace,
  sun: Sun,
  monitor: Monitor,
  "monitor-x": MonitorX,
  smartphone: Smartphone,
  camera: Camera,
  "volume-x": VolumeX,
  "wifi-off": WifiOff,
  "shield-check": ShieldCheck,
};

const CATEGORY_LABELS: Record<string, string> = {
  estado: "Estado Físico",
  bateria: "Saúde de Bateria",
  funcionalidade: "Funcionalidades",
  garantia: "Garantia",
};

const CATEGORY_ORDER = ["estado", "bateria", "funcionalidade", "garantia"];

export default function ConditionDeductions({
  activeDeductions,
  customDeductions,
  onToggle,
  onUpdateValue,
  onAddCustom,
  onRemoveCustom,
  onUpdateCustom,
  disabled = false,
  totalDeductions,
  totalBonus,
}: ConditionDeductionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customValue, setCustomValue] = useState("");

  const activeIds = new Set(activeDeductions.map((d) => d.id));
  const getActiveValue = (id: string) => activeDeductions.find((d) => d.id === id)?.value ?? 0;

  const handleStartEdit = (id: string, currentValue: number) => {
    setEditingId(id);
    setEditValue(String(Math.abs(currentValue)));
  };

  const handleConfirmEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateValue(id, val);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleResetValue = (id: string) => {
    const def = CONDITION_DEDUCTIONS.find((cd) => cd.id === id);
    if (def) {
      onUpdateValue(id, def.defaultValue);
    }
  };

  const handleAddCustom = () => {
    const val = parseFloat(customValue);
    if (!isNaN(val) && val > 0 && customLabel.trim()) {
      onAddCustom(customLabel.trim(), val);
      setCustomLabel("");
      setCustomValue("");
      setShowAddCustom(false);
    }
  };

  // Agrupar deductions por categoria
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: CONDITION_DEDUCTIONS.filter((d) => d.category === cat),
  }));

  const netDeductions = totalDeductions - totalBonus;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-coral" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Condição do Aparelho</h2>
        </div>
        {netDeductions !== 0 && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            netDeductions > 0 ? "badge-danger" : "bg-emerald-light text-emerald"
          }`}>
            {netDeductions > 0 ? `-${formatCurrency(netDeductions)}` : `+${formatCurrency(Math.abs(netDeductions))}`}
          </span>
        )}
      </div>

      {disabled && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Selecione um aparelho de troca na aba <strong>Troca</strong> para avaliar a condição.
          </p>
        </div>
      )}

      {/* Lista por categoria */}
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 px-1">
              {group.label}
            </p>
            <div className="grid gap-1.5">
              {group.items.map((deduction) => {
                const isActive = activeIds.has(deduction.id);
                const isBonus = deduction.defaultValue < 0;
                const currentValue = isActive ? getActiveValue(deduction.id) : deduction.defaultValue;
                const isEditing = editingId === deduction.id;
                const IconComp = ICON_MAP[deduction.icon] || AlertTriangle;
                const wasEdited = isActive && Math.abs(currentValue) !== Math.abs(deduction.defaultValue);

                return (
                  <div
                    key={deduction.id}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                      disabled
                        ? "opacity-40 cursor-not-allowed bg-muted"
                        : isActive
                        ? isBonus
                          ? "bg-emerald-light border border-emerald/25 shadow-sm"
                          : "bg-destructive/8 border border-destructive/25 shadow-sm"
                        : "bg-card border border-border hover:border-muted-foreground/20"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => !disabled && onToggle(deduction.id)}
                      disabled={disabled}
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${
                        isActive
                          ? isBonus
                            ? "bg-emerald border-emerald"
                            : "bg-destructive border-destructive"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {isActive && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Ícone */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isActive ? (isBonus ? "bg-emerald/15" : "bg-destructive/15") : "bg-muted"
                    }`}>
                      <IconComp className={`w-3 h-3 ${
                        isActive ? (isBonus ? "text-emerald" : "text-destructive") : "text-muted-foreground"
                      }`} />
                    </div>

                    {/* Info — clicável para toggle */}
                    <button
                      onClick={() => !disabled && onToggle(deduction.id)}
                      disabled={disabled}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className={`text-sm font-semibold leading-tight ${
                        isActive ? (isBonus ? "text-emerald" : "text-destructive") : "text-foreground"
                      }`}>
                        {deduction.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{deduction.description}</p>
                    </button>

                    {/* Valor — editável quando ativo */}
                    {isActive && isEditing ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground">R$</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmEdit(deduction.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onBlur={() => handleConfirmEdit(deduction.id)}
                          autoFocus
                          className="w-20 px-2 py-1 text-xs text-right font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <>
                            {wasEdited && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResetValue(deduction.id); }}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors"
                                title="Resetar para valor padrão"
                              >
                                <RotateCcw className="w-3 h-3 text-muted-foreground" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(deduction.id, currentValue); }}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors"
                              title="Editar valor"
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </>
                        )}
                        <span className={`money-value text-sm shrink-0 ${
                          isActive
                            ? isBonus
                              ? "text-emerald font-bold"
                              : "text-destructive font-bold"
                            : "text-muted-foreground"
                        }`}>
                          {isBonus ? "+" : "-"}{formatCurrency(Math.abs(currentValue))}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Abatimentos personalizados (Outros) */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 px-1">
            Outros Abatimentos
          </p>

          {/* Lista de custom deductions existentes */}
          {customDeductions.map((custom) => (
            <div
              key={custom.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-1.5"
            >
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-amber-100 shrink-0">
                <Pencil className="w-3 h-3 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 leading-tight">{custom.label}</p>
              </div>
              <span className="money-value text-sm text-destructive font-bold shrink-0">
                -{formatCurrency(custom.value)}
              </span>
              <button
                onClick={() => onRemoveCustom(custom.id)}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-200 transition-colors shrink-0"
              >
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </div>
          ))}

          {/* Formulário para adicionar novo */}
          {showAddCustom ? (
            <div className="p-3 bg-card border border-border rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Motivo do abatimento..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <div className="flex gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-muted-foreground font-medium">R$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Valor"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCustom(); }}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!customLabel.trim() || !customValue || parseFloat(customValue) <= 0}
                  className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => { setShowAddCustom(false); setCustomLabel(""); setCustomValue(""); }}
                  className="px-3 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md hover:bg-accent transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => !disabled && setShowAddCustom(true)}
              disabled={disabled}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed transition-all ${
                disabled
                  ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                  : "border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Adicionar outro abatimento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
