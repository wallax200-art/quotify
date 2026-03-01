/**
 * Help — Página de Ajuda / Tutorial — Quotify
 * Guia passo a passo para configurar o sistema de acordo com a loja
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  HelpCircle,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Percent,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  Sun,
  Moon,
  Calculator,
  Settings,
  Smartphone,
  Share,
  MoreVertical,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface HelpSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: "inicio",
    icon: Calculator,
    title: "Como Funciona o Quotify",
    subtitle: "Entenda o fluxo básico do sistema de orçamentos",
    steps: [
      {
        title: "Selecione o Produto para Venda",
        description:
          "Na aba \"Produto\", escolha a categoria (iPhones, iPads, Apple Watch, MacBooks, Acessórios), filtre por Seminovos ou Lacrados, e clique no modelo desejado. O preço será exibido automaticamente no resumo.",
        tip: "Use a barra de busca para encontrar rapidamente um modelo específico.",
      },
      {
        title: "Selecione o Produto de Troca (Upgrade)",
        description:
          "Na aba \"Troca\", selecione o aparelho que o cliente está dando como entrada. O valor de trade-in será descontado automaticamente do preço final.",
        tip: "Se o cliente não tem aparelho para troca, pule esta etapa.",
      },
      {
        title: "Aplique as Condições do Aparelho",
        description:
          "Na aba \"Condição\", marque os abatimentos que se aplicam ao aparelho do cliente (tela trincada, bateria ruim, etc.). Cada condição reduz o valor do trade-in.",
        tip: "Você também pode adicionar abatimentos personalizados para situações específicas.",
      },
      {
        title: "Escolha o Parcelamento",
        description:
          "Na aba \"Parcelas\", selecione em quantas vezes o cliente deseja pagar. O sistema calcula automaticamente o valor com a taxa da maquininha.",
        tip: "O valor à vista (PIX) sempre aparece no resumo, independente do parcelamento escolhido.",
      },
      {
        title: "Envie o Orçamento",
        description:
          "No resumo lateral (ou clicando em \"Ver Orçamento\" no mobile), revise todos os valores e clique em \"Enviar via WhatsApp\" para compartilhar com o cliente.",
      },
    ],
  },
  {
    id: "produtos",
    icon: Package,
    title: "Configurar Produtos à Venda",
    subtitle: "Como alterar preços e adicionar novos produtos",
    steps: [
      {
        title: "Acesse as Configurações",
        description:
          "Clique no ícone de engrenagem (⚙️) no canto superior direito do dashboard para abrir a página de configurações.",
      },
      {
        title: "Selecione a aba \"Produtos à Venda\"",
        description:
          "Esta é a primeira aba das configurações. Aqui você vê todos os produtos disponíveis para venda, organizados por modelo.",
      },
      {
        title: "Alterar o preço de um produto",
        description:
          "Clique no botão de editar (ícone de lápis ✏️) ao lado do produto. Digite o novo preço e clique em \"Salvar\". O preço será atualizado imediatamente nos orçamentos.",
        tip: "Você também pode editar preços diretamente na tela principal clicando no valor \"A definir\" ou no preço atual do produto.",
      },
      {
        title: "Adicionar um novo produto",
        description:
          "Clique no botão \"+ Novo Produto\" no topo da lista. Preencha: nome do produto, categoria (ex: iPhone 16 Pro), armazenamento (ex: 256GB), condição (Seminovo ou Lacrado), categoria de produto (iPhones, iPads, etc.) e o preço de venda.",
        tip: "Organize os produtos por categoria para facilitar a busca durante o atendimento.",
      },
      {
        title: "Remover um produto",
        description:
          "Clique no ícone de lixeira (🗑️) ao lado do produto que deseja remover. A remoção é imediata.",
        tip: "Cuidado: a remoção não pode ser desfeita. Se errar, você precisará adicionar o produto novamente.",
      },
    ],
  },
  {
    id: "upgrade",
    icon: ArrowLeftRight,
    title: "Configurar Produtos de Troca (Upgrade)",
    subtitle: "Como definir valores de trade-in dos aparelhos usados",
    steps: [
      {
        title: "Acesse a aba \"Produtos Upgrade\"",
        description:
          "Nas configurações, clique na aba \"Produtos Upgrade\". Aqui ficam os aparelhos que os clientes podem dar como entrada (trade-in).",
      },
      {
        title: "Alterar o valor de trade-in",
        description:
          "Clique no botão de editar (✏️) ao lado do produto de troca. Atualize o valor que a sua loja paga pelo aparelho usado e clique em \"Salvar\".",
        tip: "Revise os valores de trade-in regularmente conforme o mercado muda.",
      },
      {
        title: "Adicionar novo produto de troca",
        description:
          "Clique em \"+ Novo Upgrade\" e preencha: nome do aparelho, categoria, armazenamento e o valor de trade-in que a sua loja oferece.",
      },
      {
        title: "Entenda o cálculo",
        description:
          "O valor de trade-in é descontado do preço do produto à venda. Exemplo: iPhone 16 Pro (R$ 8.000) - iPhone 14 trade-in (R$ 3.000) = R$ 5.000 a pagar.",
        tip: "Os abatimentos por condição do aparelho são descontados do valor de trade-in, não do preço final.",
      },
    ],
  },
  {
    id: "abatimentos",
    icon: AlertTriangle,
    title: "Configurar Abatimentos (Condições)",
    subtitle: "Como adicionar deduções por estado do aparelho usado",
    steps: [
      {
        title: "Acesse a aba \"Abatimentos\"",
        description:
          "Nas configurações, clique na aba \"Abatimentos\". Aqui você define as condições que reduzem o valor do trade-in do aparelho do cliente.",
      },
      {
        title: "Entenda os tipos de abatimento",
        description:
          "Existem dois tipos: valor fixo (ex: -R$ 200 por tela trincada) e porcentagem (ex: -10% por bateria degradada). Escolha o tipo mais adequado para cada condição.",
      },
      {
        title: "Adicionar novo abatimento",
        description:
          "Clique em \"+ Novo Abatimento\" e preencha: nome da condição (ex: \"Tela Trincada\"), tipo (fixo ou porcentagem) e o valor do desconto.",
        tip: "Crie abatimentos para as condições mais comuns: tela trincada, bateria ruim, botões com defeito, câmera riscada, etc.",
      },
      {
        title: "Editar ou remover abatimentos",
        description:
          "Use os ícones de editar (✏️) e lixeira (🗑️) para modificar ou remover abatimentos existentes.",
      },
      {
        title: "Abatimentos personalizados no orçamento",
        description:
          "Durante o orçamento, na aba \"Condição\", você também pode adicionar abatimentos personalizados para situações únicas que não estão na lista padrão.",
        tip: "Os abatimentos personalizados são temporários e valem apenas para aquele orçamento específico.",
      },
    ],
  },
  {
    id: "taxas",
    icon: Percent,
    title: "Configurar Taxas de Parcelamento",
    subtitle: "Como definir as taxas da maquininha para cada parcela",
    steps: [
      {
        title: "Acesse a aba \"Taxas de Parcelamento\"",
        description:
          "Nas configurações, clique na aba \"Taxas de Parcelamento\". Aqui você define a taxa cobrada pela maquininha para cada número de parcelas.",
      },
      {
        title: "Alterar uma taxa existente",
        description:
          "Clique no botão de editar (✏️) ao lado da parcela desejada. Atualize a porcentagem da taxa e clique em \"Salvar\".",
        tip: "Consulte o extrato da sua maquininha para saber as taxas exatas cobradas por cada bandeira.",
      },
      {
        title: "Adicionar nova opção de parcela",
        description:
          "Clique em \"+ Nova Taxa\" e preencha: número de parcelas (ex: 12) e a taxa percentual (ex: 15.5%).",
      },
      {
        title: "Entenda o cálculo",
        description:
          "O sistema aplica a fórmula: Valor Parcelado = Valor à Vista ÷ (1 - Taxa/100). Exemplo: R$ 5.000 com taxa de 10% = R$ 5.000 ÷ 0.90 = R$ 5.555,56 total (12x de R$ 462,96).",
        tip: "A fórmula garante que você receba o valor correto após o desconto da maquininha.",
      },
    ],
  },
  {
    id: "texto",
    icon: MessageSquare,
    title: "Personalizar o Texto do Orçamento",
    subtitle: "Como customizar a mensagem enviada ao cliente",
    steps: [
      {
        title: "Acesse a aba \"Texto do Orçamento\"",
        description:
          "Nas configurações, clique na aba \"Texto do Orçamento\". Aqui você personaliza a mensagem que acompanha o orçamento enviado via WhatsApp.",
      },
      {
        title: "Defina o nome da sua loja",
        description:
          "No campo \"Nome da Loja\", digite o nome do seu estabelecimento. Esse nome aparecerá no cabeçalho do orçamento (ex: \"📱 Orçamento – Tio Sam Imports\").",
        tip: "Se deixar em branco, o sistema usará \"Quotify\" como padrão.",
      },
      {
        title: "Personalize o texto de fechamento",
        description:
          "No campo \"Texto de Fechamento\", escreva a mensagem que aparece no final do orçamento. Inclua informações como formas de pagamento aceitas, endereço da loja, horário de funcionamento, etc.",
        tip: "Use emojis para deixar a mensagem mais amigável e profissional. Exemplo: \"✅ Aceitamos PIX, cartão e dinheiro | 📍 Rua X, 123 | ⏰ Seg-Sáb 9h-18h\"",
      },
      {
        title: "Visualize o resultado",
        description:
          "A pré-visualização na parte inferior mostra exatamente como o texto do orçamento ficará quando enviado ao cliente. Revise antes de salvar.",
      },
    ],
  },
  {
    id: "instalar",
    icon: Smartphone,
    title: "Instalar como Aplicativo no Celular",
    subtitle: "Como adicionar o Quotify à tela inicial do seu celular",
    steps: [
      {
        title: "Por que instalar?",
        description:
          "Ao adicionar o Quotify à tela inicial do celular, ele funciona como um aplicativo nativo — abre em tela cheia, sem barra de endereço, e fica acessível com um toque. Ideal para usar no balcão da loja.",
        tip: "O app funciona normalmente pelo navegador também, mas a experiência é melhor como aplicativo.",
      },
      {
        title: "No iPhone (Safari)",
        description:
          "1. Abra o Quotify no Safari (obrigatório — não funciona no Chrome do iPhone).\n2. Toque no ícone de compartilhar (quadrado com seta para cima ⬆️) na barra inferior.\n3. Role para baixo e toque em \"Adicionar à Tela de Início\".\n4. Confirme o nome e toque em \"Adicionar\".\n5. Pronto! O ícone do Quotify aparecerá na sua tela inicial.",
        tip: "No iPhone, APENAS o Safari permite adicionar sites à tela inicial. Se estiver usando Chrome ou outro navegador, copie o link e abra no Safari.",
      },
      {
        title: "No Android (Chrome)",
        description:
          "1. Abra o Quotify no Google Chrome.\n2. Toque nos três pontinhos (⋮) no canto superior direito.\n3. Toque em \"Adicionar à tela inicial\" ou \"Instalar aplicativo\".\n4. Confirme tocando em \"Adicionar\" ou \"Instalar\".\n5. Pronto! O ícone do Quotify aparecerá na sua tela inicial.",
        tip: "Em alguns celulares Android, o Chrome pode mostrar automaticamente um banner \"Instalar aplicativo\" na parte inferior da tela.",
      },
      {
        title: "No Android (Samsung Internet)",
        description:
          "1. Abra o Quotify no Samsung Internet.\n2. Toque no menu (☰) ou nos três traços na parte inferior.\n3. Toque em \"Adicionar à tela inicial\".\n4. Confirme e pronto!",
      },
      {
        title: "Dica: compartilhe com sua equipe",
        description:
          "Envie o link do Quotify (quantify.manus.space) pelo WhatsApp para seus vendedores e peça para cada um instalar como aplicativo no celular. Assim todos terão acesso rápido no balcão.",
        tip: "Cada vendedor precisa criar sua própria conta e aguardar a aprovação do administrador.",
      },
    ],
  },
];

export default function Help() {
  const { theme, toggleTheme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["inicio"])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <div>
                <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">
                  Central de Ajuda
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Aprenda a configurar o Quotify
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </button>
            )}
            <Link
              href="/configuracoes"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Ir para Configurações"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-6 max-w-3xl">
        {/* Intro */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">
                Bem-vindo à Central de Ajuda
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aqui você encontra um guia completo para configurar o Quotify de
                acordo com a sua loja. Siga os tutoriais abaixo para definir
                preços, taxas de parcelamento, condições de troca e personalizar
                o texto do orçamento.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {HELP_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setExpandedSections((prev) => { const next = new Set(prev); next.add(section.id); return next; });
                  document
                    .getElementById(`help-${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
              >
                <Icon className="w-4.5 h-4.5 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                  {section.title
                    .replace("Configurar ", "")
                    .replace("Como Funciona o Quotify", "Início")
                    .replace("Personalizar o ", "")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {HELP_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            return (
              <div
                key={section.id}
                id={`help-${section.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm scroll-mt-20"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-0">
                    <div className="border-t border-border pt-4">
                      <ol className="space-y-4">
                        {section.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {idx + 1}
                              </div>
                              {idx < section.steps.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-1.5" />
                              )}
                            </div>
                            <div className="pb-2 flex-1">
                              <h4 className="text-sm font-semibold text-foreground mb-1">
                                {step.title}
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {step.description}
                              </p>
                              {step.tip && (
                                <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                    <span className="font-semibold">Dica:</span>{" "}
                                    {step.tip}
                                  </p>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 bg-card border border-border rounded-xl p-5 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1">
            Pronto para configurar?
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Acesse as configurações e personalize o Quotify para a sua loja.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/configuracoes"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Ir para Configurações
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
