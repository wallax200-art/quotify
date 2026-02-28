/**
 * ConditionDeductions — Abatimentos por condição do aparelho de troca
 * Design: Tech Workspace — checkboxes com ícones, valores de desconto
 */
import { CONDITION_DEDUCTIONS, formatCurrency } from "@/lib/data";
import {
  Smartphone,
  Monitor,
  BatteryLow,
  ShieldAlert,
  CircleDot,
  Camera,
  ScanFace,
  VolumeX,
  PackageOpen,
  Hand,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ConditionDeductionsProps {
  selectedDeductions: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
  totalDeductions: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  monitor: Monitor,
  "battery-low": BatteryLow,
  "shield-alert": ShieldAlert,
  "circle-dot": CircleDot,
  camera: Camera,
  "scan-face": ScanFace,
  "volume-x": VolumeX,
  "package-open": PackageOpen,
  hand: Hand,
};

export default function ConditionDeductions({
  selectedDeductions,
  onToggle,
  disabled = false,
  totalDeductions,
}: ConditionDeductionsProps) {
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
        {totalDeductions > 0 && (
          <span className="badge-danger px-2.5 py-1 rounded-lg text-xs font-bold">
            -{formatCurrency(totalDeductions)}
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

      {/* Lista de condições */}
      <div className="grid gap-2">
        {CONDITION_DEDUCTIONS.map((deduction) => {
          const isActive = selectedDeductions.includes(deduction.id);
          const IconComp = ICON_MAP[deduction.icon] || AlertTriangle;

          return (
            <button
              key={deduction.id}
              onClick={() => onToggle(deduction.id)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all active:scale-[0.99] ${
                disabled
                  ? "opacity-40 cursor-not-allowed bg-muted"
                  : isActive
                  ? "bg-destructive/8 border border-destructive/25 shadow-sm"
                  : "bg-card border border-border hover:border-destructive/20 hover:bg-destructive/3"
              }`}
            >
              {/* Checkbox visual */}
              <div
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${
                  isActive
                    ? "bg-destructive border-destructive"
                    : "border-border"
                }`}
              >
                {isActive && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Ícone */}
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                isActive ? "bg-destructive/15" : "bg-muted"
              }`}>
                <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-destructive" : "text-muted-foreground"}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isActive ? "text-destructive" : "text-foreground"}`}>
                  {deduction.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{deduction.description}</p>
              </div>

              {/* Valor */}
              <span className={`money-value text-sm shrink-0 ${isActive ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                -{formatCurrency(deduction.deductionValue)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
