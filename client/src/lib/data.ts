// ============================================================
// DADOS CENTRALIZADOS DO APLICATIVO DE ORÇAMENTOS
// Design: Tech Workspace — Azul Petróleo + Verde Esmeralda
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
export interface UpgradeProduct {
  id: string;
  name: string;
  storage: string;
  tradeInValue: number;
  category: string;
}

export const UPGRADE_PRODUCTS: UpgradeProduct[] = [
  // iPhone 15 Pro Max
  { id: "up-15pm-256", name: "iPhone 15 Pro Max", storage: "256GB", tradeInValue: 5500, category: "iPhone 15 Pro Max" },
  { id: "up-15pm-512", name: "iPhone 15 Pro Max", storage: "512GB", tradeInValue: 6200, category: "iPhone 15 Pro Max" },
  { id: "up-15pm-1tb", name: "iPhone 15 Pro Max", storage: "1TB", tradeInValue: 7000, category: "iPhone 15 Pro Max" },
  // iPhone 15 Pro
  { id: "up-15p-128", name: "iPhone 15 Pro", storage: "128GB", tradeInValue: 4200, category: "iPhone 15 Pro" },
  { id: "up-15p-256", name: "iPhone 15 Pro", storage: "256GB", tradeInValue: 4800, category: "iPhone 15 Pro" },
  { id: "up-15p-512", name: "iPhone 15 Pro", storage: "512GB", tradeInValue: 5500, category: "iPhone 15 Pro" },
  // iPhone 15
  { id: "up-15-128", name: "iPhone 15", storage: "128GB", tradeInValue: 3200, category: "iPhone 15" },
  { id: "up-15-256", name: "iPhone 15", storage: "256GB", tradeInValue: 3700, category: "iPhone 15" },
  // iPhone 14 Pro Max
  { id: "up-14pm-128", name: "iPhone 14 Pro Max", storage: "128GB", tradeInValue: 3800, category: "iPhone 14 Pro Max" },
  { id: "up-14pm-256", name: "iPhone 14 Pro Max", storage: "256GB", tradeInValue: 4200, category: "iPhone 14 Pro Max" },
  { id: "up-14pm-512", name: "iPhone 14 Pro Max", storage: "512GB", tradeInValue: 4800, category: "iPhone 14 Pro Max" },
  { id: "up-14pm-1tb", name: "iPhone 14 Pro Max", storage: "1TB", tradeInValue: 5200, category: "iPhone 14 Pro Max" },
  // iPhone 14 Pro
  { id: "up-14p-128", name: "iPhone 14 Pro", storage: "128GB", tradeInValue: 3200, category: "iPhone 14 Pro" },
  { id: "up-14p-256", name: "iPhone 14 Pro", storage: "256GB", tradeInValue: 3600, category: "iPhone 14 Pro" },
  { id: "up-14p-512", name: "iPhone 14 Pro", storage: "512GB", tradeInValue: 4100, category: "iPhone 14 Pro" },
  // iPhone 14
  { id: "up-14-128", name: "iPhone 14", storage: "128GB", tradeInValue: 2400, category: "iPhone 14" },
  { id: "up-14-256", name: "iPhone 14", storage: "256GB", tradeInValue: 2800, category: "iPhone 14" },
  // iPhone 13 Pro Max
  { id: "up-13pm-128", name: "iPhone 13 Pro Max", storage: "128GB", tradeInValue: 2800, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-256", name: "iPhone 13 Pro Max", storage: "256GB", tradeInValue: 3200, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-512", name: "iPhone 13 Pro Max", storage: "512GB", tradeInValue: 3600, category: "iPhone 13 Pro Max" },
  { id: "up-13pm-1tb", name: "iPhone 13 Pro Max", storage: "1TB", tradeInValue: 3900, category: "iPhone 13 Pro Max" },
  // iPhone 13 Pro
  { id: "up-13p-128", name: "iPhone 13 Pro", storage: "128GB", tradeInValue: 2300, category: "iPhone 13 Pro" },
  { id: "up-13p-256", name: "iPhone 13 Pro", storage: "256GB", tradeInValue: 2700, category: "iPhone 13 Pro" },
  { id: "up-13p-512", name: "iPhone 13 Pro", storage: "512GB", tradeInValue: 3100, category: "iPhone 13 Pro" },
  // iPhone 13
  { id: "up-13-128", name: "iPhone 13", storage: "128GB", tradeInValue: 1800, category: "iPhone 13" },
  { id: "up-13-256", name: "iPhone 13", storage: "256GB", tradeInValue: 2100, category: "iPhone 13" },
  // iPhone 12 Pro Max
  { id: "up-12pm-128", name: "iPhone 12 Pro Max", storage: "128GB", tradeInValue: 2000, category: "iPhone 12 Pro Max" },
  { id: "up-12pm-256", name: "iPhone 12 Pro Max", storage: "256GB", tradeInValue: 2300, category: "iPhone 12 Pro Max" },
  { id: "up-12pm-512", name: "iPhone 12 Pro Max", storage: "512GB", tradeInValue: 2600, category: "iPhone 12 Pro Max" },
  // iPhone 12 Pro
  { id: "up-12p-128", name: "iPhone 12 Pro", storage: "128GB", tradeInValue: 1600, category: "iPhone 12 Pro" },
  { id: "up-12p-256", name: "iPhone 12 Pro", storage: "256GB", tradeInValue: 1900, category: "iPhone 12 Pro" },
  // iPhone 12
  { id: "up-12-64", name: "iPhone 12", storage: "64GB", tradeInValue: 1100, category: "iPhone 12" },
  { id: "up-12-128", name: "iPhone 12", storage: "128GB", tradeInValue: 1300, category: "iPhone 12" },
  // iPhone 11 Pro Max
  { id: "up-11pm-64", name: "iPhone 11 Pro Max", storage: "64GB", tradeInValue: 1400, category: "iPhone 11 Pro Max" },
  { id: "up-11pm-256", name: "iPhone 11 Pro Max", storage: "256GB", tradeInValue: 1700, category: "iPhone 11 Pro Max" },
  // iPhone 11 Pro
  { id: "up-11p-64", name: "iPhone 11 Pro", storage: "64GB", tradeInValue: 1100, category: "iPhone 11 Pro" },
  { id: "up-11p-256", name: "iPhone 11 Pro", storage: "256GB", tradeInValue: 1400, category: "iPhone 11 Pro" },
  // iPhone 11
  { id: "up-11-64", name: "iPhone 11", storage: "64GB", tradeInValue: 800, category: "iPhone 11" },
  { id: "up-11-128", name: "iPhone 11", storage: "128GB", tradeInValue: 1000, category: "iPhone 11" },
];

// --- ABATIMENTOS POR CONDIÇÃO DO APARELHO ---
export interface ConditionDeduction {
  id: string;
  label: string;
  description: string;
  deductionValue: number;
  icon: string;
}

export const CONDITION_DEDUCTIONS: ConditionDeduction[] = [
  { id: "tela-trincada", label: "Tela Trincada", description: "Display com rachaduras ou trincas visíveis", deductionValue: 350, icon: "smartphone" },
  { id: "tela-manchada", label: "Tela Manchada", description: "Display com manchas ou pixels mortos", deductionValue: 250, icon: "monitor" },
  { id: "bateria-baixa", label: "Bateria Baixa", description: "Saúde da bateria abaixo de 80%", deductionValue: 200, icon: "battery-low" },
  { id: "carcaca-danificada", label: "Carcaça Danificada", description: "Corpo com amassados, riscos profundos ou danos", deductionValue: 200, icon: "shield-alert" },
  { id: "botoes-defeito", label: "Botões com Defeito", description: "Botões laterais ou home com mau funcionamento", deductionValue: 150, icon: "circle-dot" },
  { id: "camera-defeito", label: "Câmera com Defeito", description: "Câmera traseira ou frontal com problemas", deductionValue: 300, icon: "camera" },
  { id: "face-id-defeito", label: "Face ID com Defeito", description: "Reconhecimento facial não funciona", deductionValue: 400, icon: "scan-face" },
  { id: "alto-falante-defeito", label: "Alto-falante com Defeito", description: "Som distorcido ou sem áudio", deductionValue: 150, icon: "volume-x" },
  { id: "sem-caixa", label: "Sem Caixa Original", description: "Aparelho sem caixa e acessórios originais", deductionValue: 100, icon: "package-open" },
  { id: "touch-defeito", label: "Touch com Defeito", description: "Tela touch com áreas sem resposta", deductionValue: 350, icon: "hand" },
];

// --- TAXAS DE PARCELAMENTO PADRÃO ---
export interface InstallmentRate {
  installments: number;
  rate: number; // percentual (ex: 5.99 = 5.99%)
  label: string;
}

export const DEFAULT_INSTALLMENT_RATES: InstallmentRate[] = [
  { installments: 1, rate: 0, label: "À Vista" },
  { installments: 2, rate: 0, label: "2x sem juros" },
  { installments: 3, rate: 0, label: "3x sem juros" },
  { installments: 4, rate: 5.59, label: "4x" },
  { installments: 5, rate: 6.86, label: "5x" },
  { installments: 6, rate: 8.14, label: "6x" },
  { installments: 7, rate: 9.44, label: "7x" },
  { installments: 8, rate: 10.75, label: "8x" },
  { installments: 9, rate: 12.08, label: "9x" },
  { installments: 10, rate: 13.42, label: "10x" },
  { installments: 11, rate: 14.78, label: "11x" },
  { installments: 12, rate: 16.15, label: "12x" },
];

// --- HELPERS ---
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getProductCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

export function getUpgradeCategories(products: UpgradeProduct[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}
