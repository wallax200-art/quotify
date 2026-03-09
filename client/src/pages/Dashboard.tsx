import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Smartphone,
  ArrowLeftRight,
  FileText,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  MessageCircle,
  Home as HomeIcon,
  Loader2,
  BarChart2,
  ShieldCheck,
} from "lucide-react";

const CARDS = [
  {
    id: "orcamento",
    label: "Fazer Orçamento",
    description: "Monte orçamentos rápidos para clientes",
    icon: Smartphone,
    color: "bg-blue-600",
    href: "/dashboard",
  },
  {
    id: "troca",
    label: "Troca / Upgrade",
    description: "Calcule o valor do aparelho na troca",
    icon: ArrowLeftRight,
    color: "bg-emerald-600",
    href: "/dashboard",
  },
  {
    id: "parcelas",
    label: "Parcelamento",
    description: "Simule parcelas e taxas",
    icon: BarChart2,
    color: "bg-violet-600",
    href: "/dashboard",
  },
  {
    id: "pdf",
    label: "PDF Orçamento",
    description: "Gere PDF profissional do orçamento",
    icon: FileText,
    color: "bg-sky-600",
    href: "/dashboard",
  },
  {
    id: "garantia",
    label: "Termo de Garantia",
    description: "Emita termo de garantia em PDF",
    icon: ShieldCheck,
    color: "bg-amber-600",
    href: "/dashboard",
  },
  {
    id: "configuracoes",
    label: "Configurações",
    description: "Produtos, taxas, textos e logo",
    icon: Settings,
    color: "bg-slate-600",
    href: "/configuracoes",
  },
];

export default function DashboardHome() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
      return;
    }
    if (!loading && user) {
      const status = (user as any).status;
      const role = (user as any).role;
      const accessExpired = (user as any).accessExpired;
      if (status !== "active" && role !== "master_admin") {
        setLocation("/");
      } else if (accessExpired && role !== "master_admin") {
        setLocation("/?expired=1");
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

  const isAdmin = (user as any).role === "master_admin";
  const firstName = user.name?.split(" ")[0] || "Vendedor";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png"
              alt="Quotify"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">Quotify</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Sistema de Orçamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Shield className="w-4 h-4" />
              </Link>
            )}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <a
              href="https://chat.whatsapp.com/I1FHlMvVaz2FpWG8BDBe8c?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-emerald-500 hover:bg-secondary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <Link href="/ajuda" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <HelpCircle className="w-4 h-4" />
            </Link>
            <button
              onClick={async () => {
                await logout();
                setLocation("/");
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Olá, {firstName}! 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">O que você quer fazer hoje?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                className="group relative bg-card hover:bg-card/80 border border-border rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 active:scale-[0.98]"
              >
                <div className="absolute top-3 right-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-[15px] leading-tight">{card.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-4">
          <Link
            href="/boas-vindas"
            className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-2xl px-5 py-4 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Primeiros passos</p>
              <p className="text-xs text-muted-foreground">Veja como configurar o sistema</p>
            </div>
            <svg
              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
