/**
 * Home — Dashboard principal — Quotify
 * Sistema de Orçamentos com fórmula exata da maquininha
 * Protegido: apenas usuários ativos ou admin podem acessar
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { useOrcamento } from "@/hooks/useOrcamento";
import { useConfig } from "@/contexts/ConfigContext";
import ProductSelector from "@/components/ProductSelector";
import UpgradeSelector from "@/components/UpgradeSelector";
import ConditionDeductions from "@/components/ConditionDeductions";
import InstallmentRates from "@/components/InstallmentRates";
import OrcamentoSummary from "@/components/OrcamentoSummary";
import { formatCurrency } from "@/lib/data";
import { Link, useLocation } from "wouter";
import {
  Smartphone,
  ArrowLeftRight,
  AlertTriangle,
  Percent,
  Calculator,
  Menu,
  X,
  ChevronRight,
  Settings,
  Shield,
  LogOut,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type TabId = "produto" | "upgrade" | "condicao" | "parcelas";

const TABS: { id: TabId; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "produto", label: "Produto", shortLabel: "Produto", icon: Smartphone },
  { id: "upgrade", label: "Troca", shortLabel: "Troca", icon: ArrowLeftRight },
  { id: "condicao", label: "Condição", shortLabel: "Cond.", icon: AlertTriangle },
  { id: "parcelas", label: "Parcelas", shortLabel: "Parc.", icon: Percent },
];

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const config = useConfig();
  const { theme, toggleTheme } = useTheme();

  const {
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
  } = useOrcamento(config.conditionDeductions, config.installmentRates);

  const [activeTab, setActiveTab] = useState<TabId>("produto");
  const [showSummary, setShowSummary] = useState(false);

  // Redirect non-active users to landing
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
      return;
    }
    if (!loading && user) {
      const status = (user as any).status;
      const role = (user as any).role;
      if (status !== "active" && role !== "admin") {
        setLocation("/");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const hasSelection = state.selectedProduct || state.selectedUpgrade;
  const isAdmin = (user as any).role === "admin";

  // Indicadores de status para cada tab
  const tabStatus: Record<TabId, { done: boolean; badge?: string }> = {
    produto: {
      done: !!state.selectedProduct,
      badge: state.selectedProduct ? state.selectedProduct.name.replace("iPhone ", "") : undefined,
    },
    upgrade: {
      done: !!state.selectedUpgrade,
      badge: state.selectedUpgrade ? state.selectedUpgrade.name.replace("iPhone ", "") : undefined,
    },
    condicao: {
      done: state.activeDeductions.length > 0 || state.customDeductions.length > 0,
      badge: (state.activeDeductions.length + state.customDeductions.length) > 0 ? `${state.activeDeductions.length + state.customDeductions.length}` : undefined,
    },
    parcelas: {
      done: state.selectedInstallments > 0,
      badge: state.selectedInstallments > 0 ? `${state.selectedInstallments}x` : undefined,
    },
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png" alt="Quotify" className="w-9 h-9 rounded-xl object-contain" />
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">Quotify</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Sistema de Orçamentos</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin button */}
            {isAdmin && (
              <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Painel Admin">
                <Shield className="w-4.5 h-4.5" />
              </Link>
            )}

            {/* Theme toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            )}

            {/* Configurações */}
            <Link href="/configuracoes" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Configurações">
              <Settings className="w-4.5 h-4.5" />
            </Link>

            {/* Logout */}
            <button
              onClick={async () => {
                await logout();
                setLocation("/");
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Sair"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>

            {/* Botão resumo mobile */}
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm active:scale-95 transition-transform"
            >
              {showSummary ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              {showSummary ? "Fechar" : "Resumo"}
              {hasSelection && !showSummary && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
                  {formatCurrency(calculations.amountToPay)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="container py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Coluna principal */}
          <div className="flex-1 min-w-0">
            {/* Tabs de navegação */}
            <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-5 shadow-inner">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const status = tabStatus[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-card text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {status.done && !isActive && (
                      <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-secondary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Conteúdo da tab ativa */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-sm">
              {activeTab === "produto" && (
                <ProductSelector
                  products={config.products}
                  selectedProduct={state.selectedProduct}
                  onSelect={selectProduct}
                  onUpdatePrice={(productId, newPrice) => {
                    config.updateProduct(productId, { price: newPrice });
                    // Also update the selected product in the orcamento state if it matches
                    if (state.selectedProduct && state.selectedProduct.id === productId) {
                      selectProduct({ ...state.selectedProduct, price: newPrice });
                    }
                  }}
                />
              )}
              {activeTab === "upgrade" && (
                <UpgradeSelector
                  upgradeProducts={config.upgradeProducts}
                  selectedUpgrade={state.selectedUpgrade}
                  onSelect={selectUpgrade}
                />
              )}
              {activeTab === "condicao" && (
                <ConditionDeductions
                  conditionDeductions={config.conditionDeductions}
                  activeDeductions={state.activeDeductions}
                  customDeductions={state.customDeductions}
                  onToggle={toggleDeduction}
                  onUpdateValue={updateDeductionValue}
                  onAddCustom={addCustomDeduction}
                  onRemoveCustom={removeCustomDeduction}
                  onUpdateCustom={updateCustomDeduction}
                  disabled={!state.selectedUpgrade}
                  totalDeductions={calculations.totalDeductions}
                  totalBonus={calculations.totalBonus}
                />
              )}
              {activeTab === "parcelas" && (
                <InstallmentRates
                  rates={config.installmentRates}
                  selectedInstallments={state.selectedInstallments}
                  onSelectInstallments={setInstallments}
                  amountToPay={calculations.amountToPay}
                />
              )}
            </div>

            {/* Navegação rápida entre etapas */}
            <div className="flex items-center justify-between mt-4">
              {activeTab !== "produto" && (
                <button
                  onClick={() => {
                    const idx = TABS.findIndex((t) => t.id === activeTab);
                    if (idx > 0) setActiveTab(TABS[idx - 1].id);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  Anterior
                </button>
              )}
              <div className="flex-1" />
              {activeTab !== "parcelas" && (
                <button
                  onClick={() => {
                    const idx = TABS.findIndex((t) => t.id === activeTab);
                    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                  Próximo
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar — Resumo do orçamento (desktop) */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-20">
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <OrcamentoSummary
                  selectedProduct={state.selectedProduct}
                  selectedUpgrade={state.selectedUpgrade}
                  calculations={calculations}
                  selectedInstallments={state.selectedInstallments}
                  installmentRates={config.installmentRates}
                  closingText={config.closingText}
                  onReset={resetAll}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo mobile (overlay) */}
      {showSummary && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSummary(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-card rounded-t-2xl border-t border-border p-5 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <OrcamentoSummary
              selectedProduct={state.selectedProduct}
              selectedUpgrade={state.selectedUpgrade}
              calculations={calculations}
              selectedInstallments={state.selectedInstallments}
              installmentRates={config.installmentRates}
              closingText={config.closingText}
              onReset={resetAll}
            />
          </div>
        </div>
      )}

      {/* Barra fixa mobile com valor */}
      {hasSelection && !showSummary && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">À Vista PIX</p>
              <p className="font-mono text-lg font-bold text-foreground">
                {formatCurrency(calculations.amountToPay)}
              </p>
            </div>
            <button
              onClick={() => setShowSummary(true)}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Ver Orçamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
