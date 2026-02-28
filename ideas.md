# Brainstorm - Aplicativo de Orçamentos para Loja de Importados

## Contexto
Aplicativo para vendedores de loja de importados (foco em iPhones/smartphones) montarem orçamentos rápidos para clientes. Precisa ser prático, rápido e eficiente — ferramenta de trabalho diária.

---

<response>
<idea>

## Ideia 1: "Tech Workspace" — Estética de Ferramenta Profissional

**Design Movement**: Inspirado em interfaces de ferramentas SaaS modernas como Linear, Notion e Stripe Dashboard. Clean, funcional, com hierarquia visual clara.

**Core Principles**:
1. Clareza funcional — cada elemento tem propósito claro
2. Densidade informacional controlada — muita informação sem parecer poluído
3. Micro-interações que confirmam ações — feedback tátil digital
4. Navegação por abas laterais com estados visuais claros

**Color Philosophy**: Fundo claro com tons de cinza quente (não frio). Azul petróleo (#1B4965) como cor primária para ações e destaques. Verde esmeralda (#2D6A4F) para valores positivos/descontos. Vermelho coral (#E63946) para alertas. A paleta transmite confiança e profissionalismo sem ser corporativa demais.

**Layout Paradigm**: Layout em painel dividido — sidebar fixa à esquerda com navegação, área central com formulário/calculadora, e painel lateral direito que aparece com resumo do orçamento. Em mobile, colapsa para navegação bottom-tab.

**Signature Elements**:
- Cards com borda sutil e sombra suave que "flutuam" levemente
- Badges coloridos para status e categorias de produtos
- Barra de progresso no topo mostrando etapas do orçamento

**Interaction Philosophy**: Transições suaves entre etapas. Campos que se expandem ao receber foco. Valores calculados que animam ao mudar. Toast notifications para confirmações.

**Animation**: Fade-in sequencial dos cards ao carregar. Números que fazem "count-up" ao calcular. Sidebar que desliza suavemente. Hover states com scale sutil (1.02).

**Typography System**: 
- Display: "DM Sans" Bold para títulos e valores grandes
- Body: "DM Sans" Regular para texto corrido
- Monospace: "JetBrains Mono" para valores monetários

</idea>
<probability>0.08</probability>
<text>Interface profissional estilo SaaS com painel dividido, cores sóbrias e hierarquia visual clara.</text>
</response>

---

<response>
<idea>

## Ideia 2: "Neon Commerce" — Estética Dark Mode Premium

**Design Movement**: Inspirado em interfaces de fintech e apps de trading como Robinhood Dark e Revolut. Dark mode com acentos vibrantes, sensação premium e high-tech.

**Core Principles**:
1. Dark-first — fundo escuro que destaca informações
2. Contraste dramático — elementos importantes "brilham"
3. Minimalismo funcional — só o essencial na tela
4. Hierarquia por luminosidade — mais claro = mais importante

**Color Philosophy**: Fundo quase preto (#0A0A0F) com superfícies em cinza escuro (#16161D). Ciano elétrico (#00D4FF) como cor de ação principal. Amarelo dourado (#FFD60A) para valores e preços. Verde neon (#39FF14) para descontos/abatimentos. A paleta cria sensação de tecnologia e exclusividade.

**Layout Paradigm**: Layout vertical em cards empilhados com scroll suave. Cada seção é um "bloco" independente que se expande/colapsa. Bottom navigation fixa em mobile com 4 ícones principais. Header minimalista com logo e ações rápidas.

**Signature Elements**:
- Glow effect sutil nos botões de ação (box-shadow com cor)
- Gradientes escuros nos cards (de #16161D para #1E1E2A)
- Linhas divisórias com gradiente que desaparece nas pontas

**Interaction Philosophy**: Toque/clique com ripple effect. Cards que se elevam ao hover. Transições rápidas e snappy (200ms). Haptic-like visual feedback.

**Animation**: Cards que entram com slide-up + fade. Valores que pulsam brevemente ao mudar. Skeleton loading com shimmer escuro. Accordion suave para seções.

**Typography System**:
- Display: "Space Grotesk" Bold para títulos
- Body: "Space Grotesk" Regular para texto
- Monospace: "Space Mono" para valores monetários

</idea>
<probability>0.06</probability>
<text>Interface dark mode premium com acentos neon, inspirada em fintechs, sensação high-tech e exclusiva.</text>
</response>

---

<response>
<idea>

## Ideia 3: "Apple Store Clerk" — Estética Minimalista Apple-Inspired

**Design Movement**: Inspirado diretamente na estética Apple — clean, branco, com tipografia como elemento principal. Minimalismo radical onde o conteúdo é o design.

**Core Principles**:
1. Espaço como luxo — generoso whitespace em tudo
2. Tipografia como design — tamanhos contrastantes criam hierarquia
3. Monocromático com um acento — quase todo preto/branco/cinza com azul Apple
4. Simplicidade radical — se pode remover, remove

**Color Philosophy**: Fundo branco puro (#FFFFFF) com texto em preto profundo (#1D1D1F). Cinza médio (#86868B) para texto secundário. Azul Apple (#0071E3) como única cor de acento para CTAs e links. Verde (#34C759) apenas para valores de desconto. A paleta é deliberadamente restrita para focar atenção no conteúdo.

**Layout Paradigm**: Layout de página única com scroll vertical. Seções separadas por whitespace generoso (não por linhas). Formulários em coluna central estreita (max 600px). Sticky summary bar no bottom em mobile.

**Signature Elements**:
- Tipografia em tamanhos extremos (48px para valores, 13px para labels)
- Cantos arredondados generosos (16px) em todos os containers
- Blur/frosted glass effect na barra de resumo fixa

**Interaction Philosophy**: Transições imperceptivelmente suaves. Sem efeitos chamativos. Foco em clareza e velocidade. Feedback visual mínimo mas preciso.

**Animation**: Spring animations suaves (framer-motion). Fade simples ao trocar conteúdo. Scroll-linked animations sutis. Nenhuma animação que atrase o workflow.

**Typography System**:
- Display: "SF Pro Display" / "Inter" Semibold para títulos grandes
- Body: "SF Pro Text" / "Inter" Regular para corpo
- Valores: "SF Mono" / "Geist Mono" para números e preços

</idea>
<probability>0.05</probability>
<text>Interface minimalista inspirada na Apple, branca e limpa, com tipografia como elemento principal de design.</text>
</response>

---

## Decisão

**Escolha: Ideia 1 — "Tech Workspace"**

Razões:
- É a mais prática para uso diário por vendedores — precisa ser funcional acima de tudo
- O layout em painel permite ver o orçamento sendo montado em tempo real
- As cores transmitem profissionalismo sem ser fria
- A densidade informacional controlada permite mostrar muitos produtos e cálculos sem confusão
- DM Sans é excelente para legibilidade em telas de todos os tamanhos
- O design escala bem entre desktop (tablet na loja) e mobile
