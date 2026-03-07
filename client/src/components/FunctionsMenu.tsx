/**
 * FunctionsMenu — Menu expansível de funções do Quotify
 * Mobile: bottom sheet elegante
 * Desktop: dropdown lateral
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Calculator,
  ArrowLeftRight,
  Package,
  Percent,
  Scale,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Wrench,
} from "lucide-react";

type TabId = "produto" | "upgrade" | "condicao" | "parcelas";

interface FunctionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: "tab" | "navigate";
  tabId?: TabId;
  navigateTo?: string;
}

const FUNCTIONS: FunctionItem[] = [
  {
    id: "orcamento",
    label: "Gerar orçamento",
    description: "Selecione um produto e gere o orçamento completo",
    icon: <Calculator className="w-5 h-5" />,
    action: "tab",
    tabId: "produto",
  },
  {
    id: "upgrade",
    label: "Simular upgrade",
    description: "Calcule a troca de aparelhos com abatimentos",
    icon: <ArrowLeftRight className="w-5 h-5" />,
    action: "tab",
    tabId: "upgrade",
  },
  {
    id: "produtos",
    label: "Produtos e preços",
    description: "Gerencie os produtos e preços da sua loja",
    icon: <Package className="w-5 h-5" />,
    action: "navigate",
    navigateTo: "/configuracoes",
  },
  {
    id: "taxas",
    label: "Taxas da maquininha",
    description: "Configure as taxas de parcelamento",
    icon: <Percent className="w-5 h-5" />,
    action: "navigate",
    navigateTo: "/configuracoes",
  },
  {
    id: "abatimento",
    label: "Regras de abatimento",
    description: "Defina condições e valores de desconto",
    icon: <Scale className="w-5 h-5" />,
    action: "navigate",
    navigateTo: "/configuracoes",
  },
  {
    id: "config",
    label: "Configurações da loja",
    description: "Personalize nome, texto e preferências",
    icon: <Settings className="w-5 h-5" />,
    action: "navigate",
    navigateTo: "/configuracoes",
  },
];

interface FunctionsMenuProps {
  onSelectTab: (tabId: TabId) => void;
}

export default function FunctionsMenu({ onSelectTab }: FunctionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fechar ao clicar fora (desktop)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Fechar com Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Bloquear scroll do body quando bottom sheet está aberto no mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, isMobile]);

  const handleSelect = useCallback(
    (item: FunctionItem) => {
      // Fechar menu primeiro
      setIsOpen(false);

      // Usar setTimeout para garantir que o menu fecha antes da navegação
      setTimeout(() => {
        if (item.action === "tab" && item.tabId) {
          onSelectTab(item.tabId);
        } else if (item.action === "navigate" && item.navigateTo) {
          setLocation(item.navigateTo);
        }
      }, 50);
    },
    [onSelectTab, setLocation],
  );

  const handleOverlayClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Botão trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <Wrench className="w-4 h-4" />
        <span>Ferramentas</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ─── Mobile: Bottom Sheet ─── */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9999 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
            onTouchEnd={handleOverlayClick}
            style={{ zIndex: 9999 }}
          />

          {/* Bottom Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border shadow-2xl max-h-[75vh] overflow-y-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="sticky top-0 bg-card pt-3 pb-2 px-5 border-b border-border/50">
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Ferramentas</h3>
                  <p className="text-xs text-muted-foreground">Selecione uma função</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de funções */}
            <div className="p-3 space-y-1">
              {FUNCTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(item);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-secondary/80 active:bg-secondary/90 transition-colors text-left group touch-manipulation"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>

            {/* Safe area bottom para iPhones com notch */}
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* ─── Desktop: Dropdown ─── */}
      {isOpen && !isMobile && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ zIndex: 9999 }}
        >
          <div className="p-2">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ferramentas disponíveis
              </p>
            </div>
            {FUNCTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(item);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
