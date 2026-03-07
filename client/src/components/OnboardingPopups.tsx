/**
 * OnboardingPopups — Pop-ups de orientação para novos usuários
 * Exibe 4 modais sequenciais na primeira vez que o usuário acessa o dashboard.
 * O status é salvo no localStorage para não exibir novamente.
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { X, Rocket, Settings, RefreshCw, FlaskConical, ChevronRight } from "lucide-react";

interface PopupData {
  id: string;
  icon: React.ReactNode;
  title: string;
  lines: string[];
  bullets?: string[];
  buttonText: string;
  buttonAction?: "navigate" | "next" | "close";
  navigateTo?: string;
}

const POPUPS: PopupData[] = [
  {
    id: "welcome",
    icon: <Rocket className="w-8 h-8 text-primary" />,
    title: "Bem-vindo ao Quotify",
    lines: [
      "O Quotify foi criado para ajudar lojistas a gerar orçamentos de forma rápida, profissional e padronizada.",
      "Com ele você consegue:",
    ],
    bullets: [
      "Gerar orçamentos em segundos",
      "Calcular parcelas automaticamente",
      "Simular upgrades",
      "Enviar orçamento pronto para WhatsApp",
    ],
    buttonText: "Começar",
    buttonAction: "next",
  },
  {
    id: "configure",
    icon: <Settings className="w-8 h-8 text-primary" />,
    title: "Configure sua loja",
    lines: [
      "Antes de começar a usar o Quotify, configure as informações da sua loja.",
      "Cadastre:",
    ],
    bullets: [
      "Os produtos que você vende",
      "Os preços que você pratica",
      "As taxas da sua maquininha",
    ],
    buttonText: "Ir para configurações",
    buttonAction: "navigate",
    navigateTo: "/configuracoes",
  },
  {
    id: "upgrade",
    icon: <RefreshCw className="w-8 h-8 text-primary" />,
    title: "Trabalha com upgrade?",
    lines: [
      "O Quotify permite simular trocas de aparelhos automaticamente.",
      "Basta selecionar o aparelho e informar as condições.",
      "O sistema calcula:",
    ],
    bullets: [
      "Valor da troca",
      "Abatimentos",
      "Diferença final",
    ],
    buttonText: "Entendi",
    buttonAction: "next",
  },
  {
    id: "beta",
    icon: <FlaskConical className="w-8 h-8 text-amber-500" />,
    title: "Versão Beta",
    lines: [
      "Você está utilizando o Quotify em fase de testes.",
      "Estamos melhorando o sistema constantemente.",
      "Se encontrar qualquer erro ou tiver sugestões, envie seu feedback.",
      "Sua ajuda é muito importante para evoluirmos a plataforma.",
    ],
    buttonText: "Continuar",
    buttonAction: "close",
  },
];

const STORAGE_KEY = "quotify_onboarding_done";

export default function OnboardingPopups() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Pequeno delay para não aparecer instantaneamente
      const timer = setTimeout(() => setCurrentIndex(0), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const popup = POPUPS[currentIndex];

    if (popup.buttonAction === "navigate" && popup.navigateTo) {
      localStorage.setItem(STORAGE_KEY, "true");
      setCurrentIndex(null);
      setLocation(popup.navigateTo);
      return;
    }

    if (currentIndex < POPUPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      setCurrentIndex(null);
    }
  }, [currentIndex, setLocation]);

  const handleClose = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setCurrentIndex(null);
  }, []);

  if (currentIndex === null) return null;

  const popup = POPUPS[currentIndex];
  const progress = ((currentIndex + 1) / POPUPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay escurecido */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden transition-all duration-300 ${
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Barra de progresso */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Conteúdo */}
        <div className="p-6 pt-5">
          {/* Indicador de etapa */}
          <div className="flex items-center gap-1.5 mb-4">
            {POPUPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-primary"
                    : i < currentIndex
                    ? "w-3 bg-primary/40"
                    : "w-3 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {/* Ícone */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            {popup.icon}
          </div>

          {/* Título */}
          <h2 className="text-lg font-bold text-foreground mb-3">
            {popup.title}
          </h2>

          {/* Texto */}
          <div className="space-y-2 mb-4">
            {popup.lines.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* Bullets */}
          {popup.bullets && (
            <ul className="space-y-1.5 mb-5">
              {popup.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Botão de ação */}
          <button
            onClick={handleNext}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {popup.buttonText}
          </button>

          {/* Pular */}
          {currentIndex < POPUPS.length - 1 && (
            <button
              onClick={handleClose}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular introdução
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
