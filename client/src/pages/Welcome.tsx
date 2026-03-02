/**
 * Welcome — Página de Boas-vindas — Quotify
 * Guia de primeiros passos para configurar a plataforma
 * Design clean com passos numerados e progresso visual
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  Package,
  DollarSign,
  Zap,
  FileText,
  CheckCircle2,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function Welcome() {
  const { user, logout } = useAuth();

  const steps = [
    {
      number: 1,
      title: "Adicionar Produtos à Venda",
      description:
        "Configure os iPhones que você vende com seus preços. Esses serão os produtos que aparecem nos orçamentos.",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      link: "/configuracoes",
      action: "Ir para Produtos",
    },
    {
      number: 2,
      title: "Configurar Produtos de Troca",
      description:
        "Adicione os modelos de iPhone que você aceita como troca/upgrade. Defina o valor de abatimento para cada um.",
      icon: Zap,
      color: "bg-emerald-100 text-emerald-600",
      link: "/configuracoes",
      action: "Configurar Trocas",
    },
    {
      number: 3,
      title: "Definir Taxas de Parcelamento",
      description:
        "Configure as taxas que a maquininha cobra para cada número de parcelas (1x, 2x, 3x, etc).",
      icon: DollarSign,
      color: "bg-amber-100 text-amber-600",
      link: "/configuracoes",
      action: "Definir Taxas",
    },
    {
      number: 4,
      title: "Configurar Abatimentos",
      description:
        "Defina descontos automáticos por condição do aparelho (tela trincada, bateria baixa, etc).",
      icon: Zap,
      color: "bg-purple-100 text-purple-600",
      link: "/configuracoes",
      action: "Configurar Abatimentos",
    },
    {
      number: 5,
      title: "Personalizar Texto do Orçamento",
      description:
        "Adicione o nome da sua loja e um texto de fechamento personalizado que aparecerá nos orçamentos.",
      icon: FileText,
      color: "bg-pink-100 text-pink-600",
      link: "/configuracoes",
      action: "Personalizar",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367201543/ji3XHgPR7e79CMEH66Wkcf/quotify-logo_86d4c6b7.png"
              alt="Quotify"
              className="w-9 h-9 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">
                Quotify
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Sistema de Orçamentos
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Sair"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground mb-6">
            Vamos configurar sua plataforma em 5 passos simples
          </p>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link key={step.number} href={step.link}>
                <div className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-4">
                    {/* Step number circle */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center font-bold text-lg`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        {step.action}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info box */}
        <div className="mt-10 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                Dica: Comece pela Configuração
              </h4>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                Dedique alguns minutos para configurar seus produtos, taxas e abatimentos. Isso garante que seus orçamentos sejam precisos e reflijam exatamente sua operação.
              </p>
            </div>
          </div>
        </div>

        {/* Skip button */}
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard">
            <button className="text-sm text-muted-foreground hover:text-foreground underline">
              Pular para o Dashboard →
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
