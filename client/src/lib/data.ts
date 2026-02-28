// ============================================================
// DADOS CENTRALIZADOS — TIO SAM IMPORTS
// Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
// Taxas FIXAS: 8x=9,630% | 10x=10,760% | 12x=11,880% | 18x=17,000%
// ============================================================

// --- TIPOS ---

export type ProductCondition = "novo" | "seminovo";

export interface ProductCategory {
  id: string;
  name: string; // ex: "iPhones"
  icon: string; // lucide icon name
}

export interface Product {
  id: string;
  name: string;
  storage: string;
  color?: string;
  price: number;
  condition: ProductCondition;
  category: string; // nome do modelo (ex: "iPhone 16 Pro Max")
  productCategory: string; // categoria pai (ex: "iPhones")
}

export interface UpgradeProduct {
  id: string;
  name: string;
  storage: string;
  tradeInValue: number;
  category: string;
}

export interface ConditionDeduction {
  id: string;
  label: string;
  description: string;
  defaultValue: number;
  icon: string;
  category: "estado" | "bateria" | "funcionalidade" | "garantia";
}

export interface InstallmentRate {
  installments: number;
  rate: number;
  label: string;
}

// --- CATEGORIAS DE PRODUTO ---
export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "iphones", name: "iPhones", icon: "smartphone" },
];

// --- CORES DISPONÍVEIS POR MODELO ---
export const IPHONE_COLORS: Record<string, string[]> = {
  // iPhone XR
  "iPhone XR": ["Preto", "Branco", "Azul", "Amarelo", "Coral", "Vermelho"],
  // iPhone 11
  "iPhone 11": ["Preto", "Branco", "Verde", "Amarelo", "Roxo", "Vermelho"],
  "iPhone 11 Pro": ["Cinza Espacial", "Prateado", "Dourado", "Verde Meia-Noite"],
  "iPhone 11 Pro Max": ["Cinza Espacial", "Prateado", "Dourado", "Verde Meia-Noite"],
  // iPhone 12
  "iPhone 12 mini": ["Preto", "Branco", "Azul", "Verde", "Roxo", "Vermelho"],
  "iPhone 12": ["Preto", "Branco", "Azul", "Verde", "Roxo", "Vermelho"],
  "iPhone 12 Pro": ["Grafite", "Prateado", "Dourado", "Azul Pacífico"],
  "iPhone 12 Pro Max": ["Grafite", "Prateado", "Dourado", "Azul Pacífico"],
  // iPhone 13
  "iPhone 13 mini": ["Meia-Noite", "Estelar", "Azul", "Rosa", "Verde", "Vermelho"],
  "iPhone 13": ["Meia-Noite", "Estelar", "Azul", "Rosa", "Verde", "Vermelho"],
  "iPhone 13 Pro": ["Grafite", "Prateado", "Dourado", "Azul Sierra", "Verde Alpino"],
  "iPhone 13 Pro Max": ["Grafite", "Prateado", "Dourado", "Azul Sierra", "Verde Alpino"],
  // iPhone 14
  "iPhone 14": ["Meia-Noite", "Estelar", "Azul", "Roxo", "Vermelho", "Amarelo"],
  "iPhone 14 Plus": ["Meia-Noite", "Estelar", "Azul", "Roxo", "Vermelho", "Amarelo"],
  "iPhone 14 Pro": ["Preto Espacial", "Prateado", "Dourado", "Roxo Profundo"],
  "iPhone 14 Pro Max": ["Preto Espacial", "Prateado", "Dourado", "Roxo Profundo"],
  // iPhone 15
  "iPhone 15": ["Preto", "Azul", "Verde", "Amarelo", "Rosa"],
  "iPhone 15 Plus": ["Preto", "Azul", "Verde", "Amarelo", "Rosa"],
  "iPhone 15 Pro": ["Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto"],
  "iPhone 15 Pro Max": ["Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto"],
  // iPhone 16
  "iPhone 16": ["Preto", "Branco", "Azul Ultramarino", "Verde-Azulado", "Rosa"],
  "iPhone 16 Plus": ["Preto", "Branco", "Azul Ultramarino", "Verde-Azulado", "Rosa"],
  "iPhone 16 Pro": ["Titânio Natural", "Titânio Preto", "Titânio Branco", "Titânio Deserto"],
  "iPhone 16 Pro Max": ["Titânio Natural", "Titânio Preto", "Titânio Branco", "Titânio Deserto"],
  // iPhone 17
  "iPhone 17": ["Preto", "Branco", "Verde", "Rosa"],
  "iPhone 17 Air": ["Preto", "Estelar", "Verde"],
  "iPhone 17 Pro": ["Titânio Natural", "Titânio Preto", "Titânio Branco", "Titânio Verde"],
  "iPhone 17 Pro Max": ["Titânio Natural", "Titânio Preto", "Titânio Branco", "Titânio Verde"],
};

// --- ARMAZENAMENTOS POR MODELO ---
const STORAGE_MAP: Record<string, string[]> = {
  "iPhone XR": ["64GB", "128GB", "256GB"],
  "iPhone 11": ["64GB", "128GB", "256GB"],
  "iPhone 11 Pro": ["64GB", "256GB", "512GB"],
  "iPhone 11 Pro Max": ["64GB", "256GB", "512GB"],
  "iPhone 12 mini": ["64GB", "128GB", "256GB"],
  "iPhone 12": ["64GB", "128GB", "256GB"],
  "iPhone 12 Pro": ["128GB", "256GB", "512GB"],
  "iPhone 12 Pro Max": ["128GB", "256GB", "512GB"],
  "iPhone 13 mini": ["128GB", "256GB", "512GB"],
  "iPhone 13": ["128GB", "256GB", "512GB"],
  "iPhone 13 Pro": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 13 Pro Max": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 14": ["128GB", "256GB"],
  "iPhone 14 Plus": ["128GB", "256GB"],
  "iPhone 14 Pro": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 14 Pro Max": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 15": ["128GB", "256GB", "512GB"],
  "iPhone 15 Plus": ["128GB", "256GB", "512GB"],
  "iPhone 15 Pro": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 15 Pro Max": ["256GB", "512GB", "1TB"],
  "iPhone 16": ["128GB", "256GB", "512GB"],
  "iPhone 16 Plus": ["128GB", "256GB", "512GB"],
  "iPhone 16 Pro": ["128GB", "256GB", "512GB", "1TB"],
  "iPhone 16 Pro Max": ["256GB", "512GB", "1TB"],
  "iPhone 17": ["256GB", "512GB"],
  "iPhone 17 Air": ["256GB", "512GB"],
  "iPhone 17 Pro": ["256GB", "512GB", "1TB"],
  "iPhone 17 Pro Max": ["256GB", "512GB", "1TB"],
};

// Modelos seminovos: XR até 17 Pro Max (todos)
const SEMINOVO_MODELS = [
  "iPhone XR",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
];

// Modelos lacrados (novos): apenas os que existem lacrado
const LACRADO_MODELS = [
  "iPhone 13",       // base
  "iPhone 16",       // base/entrada
  "iPhone 17",       // toda a linha 17
  "iPhone 17 Air",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
];

function generateId(condition: string, model: string, storage: string): string {
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace("iphone-", "");
  const storSlug = storage.toLowerCase().replace("gb", "").replace("tb", "tb");
  return `${condition}-${slug}-${storSlug}`;
}

function generateSaleProducts(): Product[] {
  const products: Product[] = [];

  // Seminovos — todos os modelos
  for (const model of SEMINOVO_MODELS) {
    const storages = STORAGE_MAP[model] || [];
    for (const storage of storages) {
      products.push({
        id: generateId("semi", model, storage),
        name: model,
        storage,
        price: 0, // preço a definir pelo dono
        condition: "seminovo",
        category: model,
        productCategory: "iPhones",
      });
    }
  }

  // Lacrados — apenas modelos disponíveis
  for (const model of LACRADO_MODELS) {
    const storages = STORAGE_MAP[model] || [];
    for (const storage of storages) {
      products.push({
        id: generateId("novo", model, storage),
        name: model,
        storage,
        price: 0, // preço a definir pelo dono
        condition: "novo",
        category: model,
        productCategory: "iPhones",
      });
    }
  }

  return products;
}

// --- PRODUTOS À VENDA (gerados automaticamente) ---
export const DEFAULT_PRODUCTS: Product[] = generateSaleProducts();

// --- PRODUTOS DE UPGRADE (aparelhos usados do cliente para abater) ---
export const DEFAULT_UPGRADE_PRODUCTS: UpgradeProduct[] = [
  // iPhone XR
  { id: "up-xr-64", name: "iPhone XR", storage: "64GB", tradeInValue: 400, category: "iPhone XR" },
  { id: "up-xr-128", name: "iPhone XR", storage: "128GB", tradeInValue: 500, category: "iPhone XR" },
  { id: "up-xr-256", name: "iPhone XR", storage: "256GB", tradeInValue: 600, category: "iPhone XR" },
  // iPhone 11
  { id: "up-11-64", name: "iPhone 11", storage: "64GB", tradeInValue: 700, category: "iPhone 11" },
  { id: "up-11-128", name: "iPhone 11", storage: "128GB", tradeInValue: 900, category: "iPhone 11" },
  { id: "up-11-256", name: "iPhone 11", storage: "256GB", tradeInValue: 1000, category: "iPhone 11" },
  // iPhone 11 Pro
  { id: "up-11p-64", name: "iPhone 11 Pro", storage: "64GB", tradeInValue: 700, category: "iPhone 11 Pro" },
  { id: "up-11p-256", name: "iPhone 11 Pro", storage: "256GB", tradeInValue: 800, category: "iPhone 11 Pro" },
  { id: "up-11p-512", name: "iPhone 11 Pro", storage: "512GB", tradeInValue: 900, category: "iPhone 11 Pro" },
  // iPhone 11 Pro Max
  { id: "up-11pm-64", name: "iPhone 11 Pro Max", storage: "64GB", tradeInValue: 1100, category: "iPhone 11 Pro Max" },
  { id: "up-11pm-256", name: "iPhone 11 Pro Max", storage: "256GB", tradeInValue: 1200, category: "iPhone 11 Pro Max" },
  { id: "up-11pm-512", name: "iPhone 11 Pro Max", storage: "512GB", tradeInValue: 1300, category: "iPhone 11 Pro Max" },
  // iPhone 12 mini
  { id: "up-12m-64", name: "iPhone 12 mini", storage: "64GB", tradeInValue: 1000, category: "iPhone 12 mini" },
  { id: "up-12m-128", name: "iPhone 12 mini", storage: "128GB", tradeInValue: 1100, category: "iPhone 12 mini" },
  { id: "up-12m-256", name: "iPhone 12 mini", storage: "256GB", tradeInValue: 1200, category: "iPhone 12 mini" },
  // iPhone 12
  { id: "up-12-64", name: "iPhone 12", storage: "64GB", tradeInValue: 1100, category: "iPhone 12" },
  { id: "up-12-128", name: "iPhone 12", storage: "128GB", tradeInValue: 1300, category: "iPhone 12" },
  { id: "up-12-256", name: "iPhone 12", storage: "256GB", tradeInValue: 1400, category: "iPhone 12" },
  // iPhone 12 Pro
  { id: "up-12p-128", name: "iPhone 12 Pro", storage: "128GB", tradeInValue: 1600, category: "iPhone 12 Pro" },
  { id: "up-12p-256", name: "iPhone 12 Pro", storage: "256GB", tradeInValue: 1700, category: "iPhone 12 Pro" },
  { id: "up-12p-512", name: "iPhone 12 Pro", storage: "512GB", tradeInValue: 1800, category: "iPhone 12 Pro" },
  // iPhone 12 Pro Max
  { id: "up-12pm-128", name: "iPhone 12 Pro Max", storage: "128GB", tradeInValue: 2000, category: "iPhone 12 Pro Max" },
  { id: "up-12pm-256", name: "iPhone 12 Pro Max", storage: "256GB", tradeInValue: 2100, category: "iPhone 12 Pro Max" },
  { id: "up-12pm-512", name: "iPhone 12 Pro Max", storage: "512GB", tradeInValue: 2200, category: "iPhone 12 Pro Max" },
  // iPhone 13 mini
  { id: "up-13m-128", name: "iPhone 13 mini", storage: "128GB", tradeInValue: 1350, category: "iPhone 13 mini" },
  { id: "up-13m-256", name: "iPhone 13 mini", storage: "256GB", tradeInValue: 1550, category: "iPhone 13 mini" },
  { id: "up-13m-512", name: "iPhone 13 mini", storage: "512GB", tradeInValue: 1700, category: "iPhone 13 mini" },
  // iPhone 13
  { id: "up-13-128", name: "iPhone 13", storage: "128GB", tradeInValue: 1500, category: "iPhone 13" },
  { id: "up-13-256", name: "iPhone 13", storage: "256GB", tradeInValue: 1700, category: "iPhone 13" },
  { id: "up-13-512", name: "iPhone 13", storage: "512GB", tradeInValue: 1800, category: "iPhone 13" },
  // iPhone 13 Pro
  { id: "up-13p-128", name: "iPhone 13 Pro", storage: "128GB", tradeInValue: 2200, category: "iPhone 13 Pro" },
  { id: "up-13p-256", name: "iPhone 13 Pro", storage: "256GB", tradeInValue: 2300, category: "iPhone 13 Pro" },
  { id: "up-13p-512", name: "iPhone 13 Pro", storage: "512GB", tradeInValue: 2400, category: "iPhone 13 Pro" },
  { id: "up-13p-1tb", name: "iPhone 13 Pro", storage: "1TB", tradeInValue: 2500, category: "iPhone 13 Pro" },
  // iPhone 13 Pro Max
  { id: "up-13pm-128", name: "iPhone 13 Pro Max", storage: "128GB", tradeInValue: 2400, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-256", name: "iPhone 13 Pro Max", storage: "256GB", tradeInValue: 2500, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-512", name: "iPhone 13 Pro Max", storage: "512GB", tradeInValue: 2300, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-1tb", name: "iPhone 13 Pro Max", storage: "1TB", tradeInValue: 2400, category: "iPhone 13 Pro Max" },
  // iPhone 14
  { id: "up-14-128", name: "iPhone 14", storage: "128GB", tradeInValue: 1750, category: "iPhone 14" },
  { id: "up-14-256", name: "iPhone 14", storage: "256GB", tradeInValue: 1900, category: "iPhone 14" },
  // iPhone 14 Plus
  { id: "up-14pl-128", name: "iPhone 14 Plus", storage: "128GB", tradeInValue: 2090, category: "iPhone 14 Plus" },
  { id: "up-14pl-256", name: "iPhone 14 Plus", storage: "256GB", tradeInValue: 2200, category: "iPhone 14 Plus" },
  // iPhone 14 Pro
  { id: "up-14p-128", name: "iPhone 14 Pro", storage: "128GB", tradeInValue: 2600, category: "iPhone 14 Pro" },
  { id: "up-14p-256", name: "iPhone 14 Pro", storage: "256GB", tradeInValue: 2700, category: "iPhone 14 Pro" },
  { id: "up-14p-512", name: "iPhone 14 Pro", storage: "512GB", tradeInValue: 2800, category: "iPhone 14 Pro" },
  { id: "up-14p-1tb", name: "iPhone 14 Pro", storage: "1TB", tradeInValue: 3000, category: "iPhone 14 Pro" },
  // iPhone 14 Pro Max
  { id: "up-14pm-128", name: "iPhone 14 Pro Max", storage: "128GB", tradeInValue: 3050, category: "iPhone 14 Pro Max" },
  { id: "up-14pm-256", name: "iPhone 14 Pro Max", storage: "256GB", tradeInValue: 3350, category: "iPhone 14 Pro Max" },
  { id: "up-14pm-512", name: "iPhone 14 Pro Max", storage: "512GB", tradeInValue: 3700, category: "iPhone 14 Pro Max" },
  // iPhone 15
  { id: "up-15-128", name: "iPhone 15", storage: "128GB", tradeInValue: 2500, category: "iPhone 15" },
  { id: "up-15-256", name: "iPhone 15", storage: "256GB", tradeInValue: 2750, category: "iPhone 15" },
  { id: "up-15-512", name: "iPhone 15", storage: "512GB", tradeInValue: 2850, category: "iPhone 15" },
  // iPhone 15 Plus
  { id: "up-15pl-128", name: "iPhone 15 Plus", storage: "128GB", tradeInValue: 2800, category: "iPhone 15 Plus" },
  { id: "up-15pl-256", name: "iPhone 15 Plus", storage: "256GB", tradeInValue: 2900, category: "iPhone 15 Plus" },
  { id: "up-15pl-512", name: "iPhone 15 Plus", storage: "512GB", tradeInValue: 3100, category: "iPhone 15 Plus" },
  // iPhone 15 Pro
  { id: "up-15p-128", name: "iPhone 15 Pro", storage: "128GB", tradeInValue: 3200, category: "iPhone 15 Pro" },
  { id: "up-15p-256", name: "iPhone 15 Pro", storage: "256GB", tradeInValue: 3400, category: "iPhone 15 Pro" },
  { id: "up-15p-512", name: "iPhone 15 Pro", storage: "512GB", tradeInValue: 3700, category: "iPhone 15 Pro" },
  { id: "up-15p-1tb", name: "iPhone 15 Pro", storage: "1TB", tradeInValue: 3800, category: "iPhone 15 Pro" },
  // iPhone 15 Pro Max
  { id: "up-15pm-256", name: "iPhone 15 Pro Max", storage: "256GB", tradeInValue: 3800, category: "iPhone 15 Pro Max" },
  { id: "up-15pm-512", name: "iPhone 15 Pro Max", storage: "512GB", tradeInValue: 4000, category: "iPhone 15 Pro Max" },
  { id: "up-15pm-1tb", name: "iPhone 15 Pro Max", storage: "1TB", tradeInValue: 4200, category: "iPhone 15 Pro Max" },
  // iPhone 16
  { id: "up-16-128", name: "iPhone 16", storage: "128GB", tradeInValue: 3400, category: "iPhone 16" },
  { id: "up-16-256", name: "iPhone 16", storage: "256GB", tradeInValue: 3500, category: "iPhone 16" },
  { id: "up-16-512", name: "iPhone 16", storage: "512GB", tradeInValue: 3600, category: "iPhone 16" },
  // iPhone 16 Plus
  { id: "up-16pl-128", name: "iPhone 16 Plus", storage: "128GB", tradeInValue: 3700, category: "iPhone 16 Plus" },
  { id: "up-16pl-256", name: "iPhone 16 Plus", storage: "256GB", tradeInValue: 3800, category: "iPhone 16 Plus" },
  // iPhone 16 Pro
  { id: "up-16p-128", name: "iPhone 16 Pro", storage: "128GB", tradeInValue: 4200, category: "iPhone 16 Pro" },
  { id: "up-16p-256", name: "iPhone 16 Pro", storage: "256GB", tradeInValue: 4400, category: "iPhone 16 Pro" },
  { id: "up-16p-512", name: "iPhone 16 Pro", storage: "512GB", tradeInValue: 4500, category: "iPhone 16 Pro" },
  { id: "up-16p-1tb", name: "iPhone 16 Pro", storage: "1TB", tradeInValue: 4600, category: "iPhone 16 Pro" },
  // iPhone 16 Pro Max
  { id: "up-16pm-256", name: "iPhone 16 Pro Max", storage: "256GB", tradeInValue: 5000, category: "iPhone 16 Pro Max" },
  { id: "up-16pm-512", name: "iPhone 16 Pro Max", storage: "512GB", tradeInValue: 5200, category: "iPhone 16 Pro Max" },
  { id: "up-16pm-1tb", name: "iPhone 16 Pro Max", storage: "1TB", tradeInValue: 5400, category: "iPhone 16 Pro Max" },
  // iPhone 17
  { id: "up-17-256", name: "iPhone 17", storage: "256GB", tradeInValue: 4500, category: "iPhone 17" },
  // iPhone 17 Air
  { id: "up-17a-256", name: "iPhone 17 Air", storage: "256GB", tradeInValue: 5000, category: "iPhone 17 Air" },
  { id: "up-17a-512", name: "iPhone 17 Air", storage: "512GB", tradeInValue: 5200, category: "iPhone 17 Air" },
];

// --- ABATIMENTOS POR CONDIÇÃO DO APARELHO ---
export const DEFAULT_CONDITION_DEDUCTIONS: ConditionDeduction[] = [
  { id: "detalhes-leves", label: "Detalhes Leves", description: "Arranhões leves / marcas superficiais", defaultValue: 100, icon: "sparkles", category: "estado" },
  { id: "detalhes-moderados", label: "Detalhes Moderados", description: "Riscos fortes / tampa com marcas pesadas", defaultValue: 200, icon: "shield-alert", category: "estado" },
  { id: "estado-regular", label: "Estado Regular", description: "Amassado leve / vidro traseiro trincado", defaultValue: 350, icon: "shield-x", category: "estado" },
  { id: "bateria-84-80", label: "Bateria 84% a 80%", description: "Saúde da bateria entre 84% e 80%", defaultValue: 150, icon: "battery-medium", category: "bateria" },
  { id: "bateria-abaixo-80", label: "Bateria Abaixo de 80%", description: "Saúde da bateria abaixo de 80%", defaultValue: 250, icon: "battery-low", category: "bateria" },
  { id: "face-id-defeito", label: "Face ID Falhando", description: "Reconhecimento facial não funciona", defaultValue: 300, icon: "scan-face", category: "funcionalidade" },
  { id: "true-tone-ausente", label: "True Tone Ausente", description: "True Tone não disponível", defaultValue: 125, icon: "sun", category: "funcionalidade" },
  { id: "tela-1a-linha", label: "Tela Trocada 1ª Linha", description: "Display substituído por peça de 1ª linha", defaultValue: 200, icon: "monitor", category: "funcionalidade" },
  { id: "tela-paralela", label: "Tela Paralela", description: "Display substituído por peça paralela", defaultValue: 350, icon: "monitor-x", category: "funcionalidade" },
  { id: "trinca-tela", label: "Trinca na Tela", description: "Display com rachaduras ou trincas visíveis", defaultValue: 400, icon: "smartphone", category: "funcionalidade" },
  { id: "camera-manchas", label: "Câmera com Manchas", description: "Câmera traseira ou frontal com manchas", defaultValue: 250, icon: "camera", category: "funcionalidade" },
  { id: "alto-falante-mic", label: "Alto-falante / Microfone", description: "Som distorcido, sem áudio ou microfone com defeito", defaultValue: 200, icon: "volume-x", category: "funcionalidade" },
  { id: "vibracao-rede", label: "Vibração / Rede Irregular", description: "Vibração não funciona ou rede instável", defaultValue: 200, icon: "wifi-off", category: "funcionalidade" },
  { id: "garantia-apple", label: "Garantia Apple Ativa", description: "Aparelho com garantia Apple vigente (bônus)", defaultValue: -250, icon: "shield-check", category: "garantia" },
];

// --- TAXAS DE PARCELAMENTO ---
export const DEFAULT_INSTALLMENT_RATES: InstallmentRate[] = [
  { installments: 8, rate: 0.09630, label: "8x" },
  { installments: 10, rate: 0.10760, label: "10x" },
  { installments: 12, rate: 0.11880, label: "12x" },
  { installments: 18, rate: 0.17000, label: "18x" },
];

// --- TEXTO PADRÃO DO ORÇAMENTO ---
export const DEFAULT_ORCAMENTO_CLOSING = "O que achou dessa proposta?";

// --- FUNÇÕES DE CÁLCULO ---

export function calcularParcela(valor: number, taxa: number, parcelas: number): number {
  const valorComTaxa = valor / (1 - taxa);
  const valorParcela = valorComTaxa / parcelas;
  return Math.round(valorParcela * 100) / 100;
}

export function calcularTotalParcelado(valor: number, taxa: number, parcelas: number): number {
  const parcela = calcularParcela(valor, taxa, parcelas);
  return parcela * parcelas;
}

// --- HELPERS ---
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCurrencyCode(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getProductCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

export function getUpgradeCategories(products: UpgradeProduct[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

export function gerarOrcamentoTexto(
  product: Product,
  upgrade: UpgradeProduct | null,
  amountToPay: number,
  rates: InstallmentRate[],
  closingText: string,
): string {
  const lines: string[] = [];

  lines.push("📱 Orçamento – Tio Sam Imports");
  lines.push("");
  lines.push(`📲 ${product.name}`);
  const details: string[] = [product.storage];
  if (product.color) details.push(product.color);
  if (product.condition === "seminovo") details.push("Seminovo");
  else details.push("Lacrado");
  lines.push(details.join(" • "));
  lines.push(`💰 Valor do aparelho: \`${formatCurrencyCode(product.price)}\``);
  lines.push("");

  if (upgrade) {
    lines.push("📲 Aparelho dado como parte de pagamento");
    lines.push(`• ${upgrade.name} ${upgrade.storage}`);
    lines.push("(considerado na simulação)");
    lines.push("");
    lines.push("➡️ Valor final após avaliação");
    lines.push(`À vista no PIX: \`${formatCurrencyCode(amountToPay)}\``);
  } else {
    lines.push(`À vista no PIX: \`${formatCurrencyCode(amountToPay)}\``);
  }

  lines.push("");

  for (const rate of rates) {
    const parcela = calcularParcela(amountToPay, rate.rate, rate.installments);
    lines.push(`💳 ${rate.installments}x de \`${formatCurrencyCode(parcela)}\``);
  }

  lines.push("");
  lines.push(closingText);

  return lines.join("\n");
}
