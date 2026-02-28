/**
 * Landing — Tela inicial do Quotify
 * Login + Como funciona + Solicitar acesso via WhatsApp
 * Design: Minimalista premium, SaaS moderno, mobile-first
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Smartphone,
  ArrowLeftRight,
  Calculator,
  MessageCircle,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  LogIn,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Selecione o aparelho",
    description: "Escolha o produto que o cliente deseja comprar",
  },
  {
    icon: ArrowLeftRight,
    title: "Informe o usado",
    description: "Avalie o aparelho do cliente e suas condições",
  },
  {
    icon: Calculator,
    title: "Cálculo automático",
    description: "Taxas e abatimentos calculados instantaneamente",
  },
  {
    icon: MessageCircle,
    title: "Envie no WhatsApp",
    description: "Copie o orçamento pronto e envie ao cliente",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Rápido",
    description: "Orçamento em segundos",
  },
  {
    icon: Shield,
    title: "Preciso",
    description: "Fórmula da maquininha",
  },
  {
    icon: Clock,
    title: "Prático",
    description: "Feito para o balcão",
  },
];

export default function Landing() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: publicSettings } = trpc.settings.getPublic.useQuery();

  // Redirect authenticated active users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if ((user as any).status === "active" || (user as any).role === "admin") {
        setLocation("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const whatsappNumber = publicSettings?.adminWhatsapp ?? "5500000000000";
  const whatsappMessage = encodeURIComponent("Olá, quero solicitar acesso ao Quotify para minha loja.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Show status messages for authenticated but not active users
  const showStatusMessage = isAuthenticated && user && !loading;
  const userStatus = (user as any)?.status;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald/5" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">Quotify</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Menos cálculo.{" "}
              <span className="text-primary">Mais vendas.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Sistema inteligente de orçamento para lojistas de iPhone.
              Avalie usado, calcule taxas e gere texto pronto para WhatsApp.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </Button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full px-8 py-6 text-base font-semibold border-2 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Solicitar acesso pelo WhatsApp
                  </Button>
                </a>
              </>
            ) : showStatusMessage && userStatus === "pending" ? (
              <div className="w-full max-w-md">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-amber-900 mb-1">Conta em análise</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    Sua conta está em análise. Entre em contato para liberação.
                  </p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar com o administrador
                    </Button>
                  </a>
                </div>
              </div>
            ) : showStatusMessage && userStatus === "blocked" ? (
              <div className="w-full max-w-md">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-red-900 mb-1">Conta bloqueada</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Conta bloqueada. Fale com o suporte.
                  </p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar com o suporte
                    </Button>
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-16">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-card rounded-full border border-border shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                    <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
              Como funciona o Quotify
            </h2>
            <p className="text-muted-foreground">
              Orçar. Avaliar. Fechar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative group"
                >
                  <div className="bg-background rounded-xl border border-border p-5 h-full transition-all hover:shadow-md hover:border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">
                        Passo {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Impact phrase */}
          <div className="text-center mt-12">
            <p className="text-lg sm:text-xl font-semibold text-foreground/80 italic">
              "Padronize sua equipe. Proteja sua margem. Feche mais rápido."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Feito para o ritmo real do balcão.
        </p>
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar no Quotify
            </Button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full px-8 py-6 text-base font-semibold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Solicitar acesso
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Quotify</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Quotify
          </p>
        </div>
      </footer>
    </div>
  );
}
