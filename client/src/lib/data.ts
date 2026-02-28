// ============================================================
// DADOS CENTRALIZADOS — TIO SAM IMPORTS
// Fórmula: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
// Taxas FIXAS: 8x=9,630% | 10x=10,760% | 12x=11,880% | 18x=17,000%
// ============================================================

// --- PRODUTOS À VENDA (iPhones novos) ---
export interface Product {
  id: string;
  name: string;
  storage: string;
  price: number;
  category: string;
}

export const PRODUCTS: Product[] = [
  // iPhone 16 Pro Max
  { id: "16pm-256", name: "iPhone 16 Pro Max", storage: "256GB", price: 9499, category: "iPhone 16 Pro Max" },
  { id: "16pm-512", name: "iPhone 16 Pro Max", storage: "512GB", price: 10499, category: "iPhone 16 Pro Max" },
  { id: "16pm-1tb", name: "iPhone 16 Pro Max", storage: "1TB", price: 12499, category: "iPhone 16 Pro Max" },
  // iPhone 16 Pro
  { id: "16p-128", name: "iPhone 16 Pro", storage: "128GB", price: 7999, category: "iPhone 16 Pro" },
  { id: "16p-256", name: "iPhone 16 Pro", storage: "256GB", price: 8799, category: "iPhone 16 Pro" },
  { id: "16p-512", name: "iPhone 16 Pro", storage: "512GB", price: 9999, category: "iPhone 16 Pro" },
  { id: "16p-1tb", name: "iPhone 16 Pro", storage: "1TB", price: 11499, category: "iPhone 16 Pro" },
  // iPhone 16
  { id: "16-128", name: "iPhone 16", storage: "128GB", price: 5999, category: "iPhone 16" },
  { id: "16-256", name: "iPhone 16", storage: "256GB", price: 6799, category: "iPhone 16" },
  { id: "16-512", name: "iPhone 16", storage: "512GB", price: 7999, category: "iPhone 16" },
  // iPhone 16 Plus
  { id: "16pl-128", name: "iPhone 16 Plus", storage: "128GB", price: 6999, category: "iPhone 16 Plus" },
  { id: "16pl-256", name: "iPhone 16 Plus", storage: "256GB", price: 7799, category: "iPhone 16 Plus" },
  { id: "16pl-512", name: "iPhone 16 Plus", storage: "512GB", price: 8999, category: "iPhone 16 Plus" },
  // iPhone 15 Pro Max
  { id: "15pm-256", name: "iPhone 15 Pro Max", storage: "256GB", price: 7999, category: "iPhone 15 Pro Max" },
  { id: "15pm-512", name: "iPhone 15 Pro Max", storage: "512GB", price: 8999, category: "iPhone 15 Pro Max" },
  { id: "15pm-1tb", name: "iPhone 15 Pro Max", storage: "1TB", price: 10499, category: "iPhone 15 Pro Max" },
  // iPhone 15 Pro
  { id: "15p-128", name: "iPhone 15 Pro", storage: "128GB", price: 6499, category: "iPhone 15 Pro" },
  { id: "15p-256", name: "iPhone 15 Pro", storage: "256GB", price: 7299, category: "iPhone 15 Pro" },
  { id: "15p-512", name: "iPhone 15 Pro", storage: "512GB", price: 8499, category: "iPhone 15 Pro" },
  // iPhone 15
  { id: "15-128", name: "iPhone 15", storage: "128GB", price: 4999, category: "iPhone 15" },
  { id: "15-256", name: "iPhone 15", storage: "256GB", price: 5799, category: "iPhone 15" },
  // iPhone 14
  { id: "14-128", name: "iPhone 14", storage: "128GB", price: 3999, category: "iPhone 14" },
  { id: "14-256", name: "iPhone 14", storage: "256GB", price: 4599, category: "iPhone 14" },
  // iPhone 13
  { id: "13-128", name: "iPhone 13", storage: "128GB", price: 3299, category: "iPhone 13" },
  { id: "13-256", name: "iPhone 13", storage: "256GB", price: 3799, category: "iPhone 13" },
];

// --- PRODUTOS DE UPGRADE (aparelhos usados do cliente para abater) ---
// LISTA OFICIAL DE AVALIAÇÃO — TIO SAM IMPORTS
export interface UpgradeProduct {
  id: string;
  name: string;
  storage: string;
  tradeInValue: number;
  category: string;
}

export const UPGRADE_PRODUCTS: UpgradeProduct[] = [
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
// Conforme Manual Interno de Compra e Upgrade — Tio Sam Imports
// Valores são PADRÃO mas EDITÁVEIS pelo vendedor
export interface ConditionDeduction {
  id: string;
  label: string;
  description: string;
  defaultValue: number; // valor padrão (referência)
  icon: string;
  category: "estado" | "bateria" | "funcionalidade" | "garantia";
}

export const CONDITION_DEDUCTIONS: ConditionDeduction[] = [
  // ESTADO FÍSICO
  { id: "detalhes-leves", label: "Detalhes Leves", description: "Arranhões leves / marcas superficiais", defaultValue: 100, icon: "sparkles", category: "estado" },
  { id: "detalhes-moderados", label: "Detalhes Moderados", description: "Riscos fortes / tampa com marcas pesadas", defaultValue: 200, icon: "shield-alert", category: "estado" },
  { id: "estado-regular", label: "Estado Regular", description: "Amassado leve / vidro traseiro trincado", defaultValue: 350, icon: "shield-x", category: "estado" },
  // BATERIA
  { id: "bateria-84-80", label: "Bateria 84% a 80%", description: "Saúde da bateria entre 84% e 80%", defaultValue: 150, icon: "battery-medium", category: "bateria" },
  { id: "bateria-abaixo-80", label: "Bateria Abaixo de 80%", description: "Saúde da bateria abaixo de 80%", defaultValue: 250, icon: "battery-low", category: "bateria" },
  // FUNCIONALIDADES
  { id: "face-id-defeito", label: "Face ID Falhando", description: "Reconhecimento facial não funciona", defaultValue: 300, icon: "scan-face", category: "funcionalidade" },
  { id: "true-tone-ausente", label: "True Tone Ausente", description: "True Tone não disponível", defaultValue: 125, icon: "sun", category: "funcionalidade" },
  { id: "tela-1a-linha", label: "Tela Trocada 1ª Linha", description: "Display substituído por peça de 1ª linha", defaultValue: 200, icon: "monitor", category: "funcionalidade" },
  { id: "tela-paralela", label: "Tela Paralela", description: "Display substituído por peça paralela", defaultValue: 350, icon: "monitor-x", category: "funcionalidade" },
  { id: "trinca-tela", label: "Trinca na Tela", description: "Display com rachaduras ou trincas visíveis", defaultValue: 400, icon: "smartphone", category: "funcionalidade" },
  { id: "camera-manchas", label: "Câmera com Manchas", description: "Câmera traseira ou frontal com manchas", defaultValue: 250, icon: "camera", category: "funcionalidade" },
  { id: "alto-falante-mic", label: "Alto-falante / Microfone", description: "Som distorcido, sem áudio ou microfone com defeito", defaultValue: 200, icon: "volume-x", category: "funcionalidade" },
  { id: "vibracao-rede", label: "Vibração / Rede Irregular", description: "Vibração não funciona ou rede instável", defaultValue: 200, icon: "wifi-off", category: "funcionalidade" },
  // GARANTIA (bônus positivo)
  { id: "garantia-apple", label: "Garantia Apple Ativa", description: "Aparelho com garantia Apple vigente (bônus)", defaultValue: -250, icon: "shield-check", category: "garantia" },
];

// --- TAXAS DE PARCELAMENTO FIXAS — TIO SAM IMPORTS ---
// REGRA ABSOLUTA: Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
// Taxas FIXAS e IMUTÁVEIS: 8x=9,630% | 10x=10,760% | 12x=11,880% | 18x=17,000%
export interface InstallmentRate {
  installments: number;
  rate: number; // percentual decimal (ex: 0.09630 = 9,630%)
  label: string;
}

export const DEFAULT_INSTALLMENT_RATES: InstallmentRate[] = [
  { installments: 8, rate: 0.09630, label: "8x" },
  { installments: 10, rate: 0.10760, label: "10x" },
  { installments: 12, rate: 0.11880, label: "12x" },
  { installments: 18, rate: 0.17000, label: "18x" },
];

/**
 * Calcula o valor da parcela usando a fórmula EXATA da maquininha:
 * Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas
 * 
 * - NÃO arredondar nenhum valor intermediário
 * - Arredondar apenas o valor final da parcela para 2 casas decimais
 */
export function calcularParcela(valor: number, taxa: number, parcelas: number): number {
  const valorComTaxa = valor / (1 - taxa);
  const valorParcela = valorComTaxa / parcelas;
  return Math.round(valorParcela * 100) / 100;
}

/**
 * Calcula o valor total parcelado (parcela * número de parcelas)
 */
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

/**
 * Gera o texto do orçamento formatado para WhatsApp
 * Segue EXATAMENTE o padrão da Tio Sam Imports
 */
export function gerarOrcamentoTexto(
  product: Product,
  upgrade: UpgradeProduct | null,
  amountToPay: number,
): string {
  const lines: string[] = [];

  lines.push("📱 Orçamento – Tio Sam Imports");
  lines.push("");
  lines.push(`📲 ${product.name}`);
  lines.push(`${product.storage}`);
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

  // Calcular parcelas com a fórmula exata
  for (const rate of DEFAULT_INSTALLMENT_RATES) {
    const parcela = calcularParcela(amountToPay, rate.rate, rate.installments);
    lines.push(`💳 ${rate.installments}x de \`${formatCurrencyCode(parcela)}\``);
  }

  lines.push("");
  lines.push("O que achou dessa proposta?");

  return lines.join("\n");
}
