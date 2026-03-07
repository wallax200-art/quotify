/**
 * Settings — Página de Configurações — Quotify
 * CRUD completo para: Produtos, Upgrade, Abatimentos, Taxas, Categorias, Texto
 * Design: Tech Workspace
 */
import { useState, useMemo, useRef, useCallback } from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { formatCurrency, type Product, type UpgradeProduct, type ConditionDeduction, type InstallmentRate, type ProductCategory } from "@/lib/data";
import { Link } from "wouter";
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Percent,
  FolderOpen,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Store,
  ImagePlus,
  ShieldCheck,
  Upload,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type SettingsTab = "produtos" | "upgrade" | "abatimentos" | "taxas" | "categorias" | "texto" | "logo" | "garantia";

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "produtos", label: "Produtos à Venda", icon: Package },
  { id: "upgrade", label: "Produtos Upgrade", icon: ArrowLeftRight },
  { id: "abatimentos", label: "Abatimentos", icon: AlertTriangle },
  { id: "taxas", label: "Taxas de Parcelamento", icon: Percent },
  { id: "categorias", label: "Categorias", icon: FolderOpen },
  { id: "texto", label: "Texto do Orçamento", icon: MessageSquare },
  { id: "logo", label: "Logo da Loja", icon: ImagePlus },
  { id: "garantia", label: "Termo de Garantia", icon: ShieldCheck },
];

// ==================== PRODUCT FORM ====================
function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [storage, setStorage] = useState(initial?.storage || "");
  const [color, setColor] = useState(initial?.color || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "0");
  const [condition, setCondition] = useState<"novo" | "seminovo">(initial?.condition || "seminovo");
  const [category, setCategory] = useState(initial?.category || "");
  const [productCategory, setProductCategory] = useState(initial?.productCategory || "iPhones");

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!storage.trim()) { toast.error("Armazenamento é obrigatório"); return; }
    const id = initial?.id || `${condition}-${name.toLowerCase().replace(/\s+/g, "-")}-${storage.toLowerCase()}-${Date.now()}`;
    onSave({
      id,
      name: name.trim(),
      storage: storage.trim(),
      color: color.trim() || undefined,
      price: parseFloat(price) || 0,
      condition,
      category: category.trim() || name.trim(),
      productCategory: productCategory.trim() || "iPhones",
    });
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do Produto</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 16 Pro Max" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Armazenamento</label>
          <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="256GB" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Cor (opcional)</label>
          <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Titânio Natural" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Preço (R$)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Condição</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value as "novo" | "seminovo")} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="seminovo">Seminovo</option>
            <option value="novo">Lacrado (Novo)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo (agrupamento)</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="iPhone 16 Pro Max" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
          <input value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="iPhones" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}

// ==================== UPGRADE PRODUCT FORM ====================
function UpgradeProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: UpgradeProduct;
  onSave: (p: UpgradeProduct) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [storage, setStorage] = useState(initial?.storage || "");
  const [tradeInValue, setTradeInValue] = useState(initial?.tradeInValue?.toString() || "0");
  const [category, setCategory] = useState(initial?.category || "");

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!storage.trim()) { toast.error("Armazenamento é obrigatório"); return; }
    const id = initial?.id || `up-${name.toLowerCase().replace(/\s+/g, "-")}-${storage.toLowerCase()}-${Date.now()}`;
    onSave({
      id,
      name: name.trim(),
      storage: storage.trim(),
      tradeInValue: parseFloat(tradeInValue) || 0,
      category: category.trim() || name.trim(),
    });
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do Produto</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="iPhone 14 Pro Max" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Armazenamento</label>
          <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="256GB" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Valor de Avaliação (R$)</label>
          <input type="number" value={tradeInValue} onChange={(e) => setTradeInValue(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo (agrupamento)</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="iPhone 14 Pro Max" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}

// ==================== DEDUCTION FORM ====================
function DeductionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ConditionDeduction;
  onSave: (d: ConditionDeduction) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [defaultValue, setDefaultValue] = useState(initial?.defaultValue?.toString() || "0");
  const [category, setCategory] = useState<ConditionDeduction["category"]>(initial?.category || "funcionalidade");

  const handleSave = () => {
    if (!label.trim()) { toast.error("Nome é obrigatório"); return; }
    const id = initial?.id || `ded-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    onSave({
      id,
      label: label.trim(),
      description: description.trim(),
      defaultValue: parseFloat(defaultValue) || 0,
      icon: initial?.icon || "circle",
      category,
    });
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tela Trincada" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Display com rachaduras" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Valor Padrão (R$)</label>
          <input type="number" value={defaultValue} onChange={(e) => setDefaultValue(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono" />
          <p className="text-[10px] text-muted-foreground mt-1">Negativo = bônus (ex: -250 para garantia)</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ConditionDeduction["category"])} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="estado">Estado Físico</option>
            <option value="bateria">Saúde de Bateria</option>
            <option value="funcionalidade">Funcionalidades</option>
            <option value="garantia">Garantia</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}

// ==================== RATE FORM ====================
function RateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: InstallmentRate;
  onSave: (r: InstallmentRate) => void;
  onCancel: () => void;
}) {
  const [installments, setInstallments] = useState(initial?.installments?.toString() || "");
  const [rate, setRate] = useState(initial ? (initial.rate * 100).toFixed(3) : "");

  const handleSave = () => {
    const inst = parseInt(installments);
    const rateVal = parseFloat(rate);
    if (!inst || inst < 1) { toast.error("Número de parcelas inválido"); return; }
    if (isNaN(rateVal) || rateVal < 0) { toast.error("Taxa inválida"); return; }
    onSave({
      installments: inst,
      rate: rateVal / 100,
      label: `${inst}x`,
    });
  };

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Número de Parcelas</label>
          <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} placeholder="8" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono" disabled={!!initial} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Taxa (%)</label>
          <input type="number" step="0.001" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="9.630" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN SETTINGS PAGE ====================
export default function Settings() {
  const config = useConfig();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("produtos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<"all" | "novo" | "seminovo">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("iPhones");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Categorias de produto disponíveis
  const availableProductCategories = useMemo(() => {
    const cats = Array.from(new Set(config.products.map(p => p.productCategory)));
    const order = ["iPhones", "iPads", "Apple Watch", "MacBooks", "Acessórios"];
    return cats.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)));
  }, [config.products]);

  // ==================== PRODUTOS À VENDA ====================
  const filteredProducts = useMemo(() => {
    let items = config.products;
    items = items.filter(p => p.productCategory === productCategoryFilter);
    if (conditionFilter !== "all") items = items.filter(p => p.condition === conditionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.storage.toLowerCase().includes(q) || (p.color && p.color.toLowerCase().includes(q)) || (p.specs && p.specs.toLowerCase().includes(q)));
    }
    return items;
  }, [config.products, search, conditionFilter, productCategoryFilter]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredProducts) {
      const key = `${p.condition === "novo" ? "🟢 " : "🔵 "}${p.category}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [filteredProducts]);

  // ==================== PRODUTOS UPGRADE ====================
  const filteredUpgrade = useMemo(() => {
    if (!search.trim()) return config.upgradeProducts;
    const q = search.toLowerCase();
    return config.upgradeProducts.filter(p => p.name.toLowerCase().includes(q) || p.storage.toLowerCase().includes(q));
  }, [config.upgradeProducts, search]);

  const upgradeByCategory = useMemo(() => {
    const map = new Map<string, UpgradeProduct[]>();
    for (const p of filteredUpgrade) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [filteredUpgrade]);

  const handleResetTab = () => {
    switch (activeTab) {
      case "produtos": config.resetProducts(); toast.success("Produtos restaurados ao padrão"); break;
      case "upgrade": config.resetUpgradeProducts(); toast.success("Produtos de upgrade restaurados"); break;
      case "abatimentos": config.resetDeductions(); toast.success("Abatimentos restaurados ao padrão"); break;
      case "taxas": config.resetRates(); toast.success("Taxas restauradas ao padrão"); break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <SettingsIcon className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">Configurações</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Quotify</p>
            </div>
          </div>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          )}
        </div>
      </header>

      <div className="container py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de navegação */}
          <div className="lg:w-60 shrink-0">
            <nav className="lg:sticky lg:top-20">
              {/* Mobile: grid de 2 ou 3 colunas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 lg:gap-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setShowForm(false); setEditingId(null); setSearch(""); }}
                      className={`flex items-center gap-2.5 px-3 py-3 lg:py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-border lg:border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(activeTab === "produtos" || activeTab === "upgrade") && (
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm"
                    />
                  </div>
                )}
                {activeTab === "produtos" && (
                  <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
                    {(["all", "seminovo", "novo"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setConditionFilter(f)}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          conditionFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f === "all" ? "Todos" : f === "novo" ? "Lacrados" : "Seminovos"}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5 ml-auto">
                  {activeTab !== "categorias" && activeTab !== "texto" && activeTab !== "logo" && activeTab !== "garantia" && (
                    <button onClick={handleResetTab} className="px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1" title="Restaurar padrão">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restaurar</span>
                    </button>
                  )}
                  {activeTab !== "texto" && activeTab !== "logo" && activeTab !== "garantia" && (
                    <button
                      onClick={() => { setShowForm(true); setEditingId(null); }}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  )}
                </div>
              </div>

              {/* ==================== PRODUTOS À VENDA ==================== */}
              {activeTab === "produtos" && (
                <div className="space-y-3">
                  {/* Filtro por categoria de produto */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {availableProductCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setProductCategoryFilter(cat); setConditionFilter("all"); setExpandedCategories(new Set()); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                          productCategoryFilter === cat
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-secondary-foreground hover:bg-accent"
                        }`}
                      >
                        {cat}
                        <span className={`text-[9px] px-1 py-0.5 rounded ${productCategoryFilter === cat ? "bg-primary-foreground/20" : "bg-background/50"}`}>
                          {config.products.filter(p => p.productCategory === cat).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  {showForm && !editingId && (
                    <ProductForm
                      onSave={(p) => { config.addProduct(p); setShowForm(false); toast.success("Produto adicionado"); }}
                      onCancel={() => setShowForm(false)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{filteredProducts.length} produto(s) encontrado(s)</p>
                  {Array.from(productsByCategory.entries()).map(([cat, items]) => (
                    <div key={cat} className="border border-border rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(cat)} className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors">
                        <span className="text-xs font-semibold text-foreground">{cat} <span className="text-muted-foreground font-normal">({items.length})</span></span>
                        {expandedCategories.has(cat) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {expandedCategories.has(cat) && (
                        <div className="divide-y divide-border">
                          {items.map((p) => (
                            <div key={p.id}>
                              {editingId === p.id ? (
                                <div className="p-2">
                                  <ProductForm
                                    initial={p}
                                    onSave={(updated) => { config.updateProduct(p.id, updated); setEditingId(null); toast.success("Produto atualizado"); }}
                                    onCancel={() => setEditingId(null)}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-between px-3 py-2 hover:bg-secondary/30 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary font-medium text-muted-foreground shrink-0">{p.storage}</span>
                                    <div className="min-w-0">
                                      <span className="text-xs text-foreground">{p.name}</span>
                                      {p.color && <span className="text-[10px] text-muted-foreground ml-1.5">• {p.color}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-mono font-semibold ${p.price > 0 ? "text-foreground" : "text-amber-500"}`}>
                                      {p.price > 0 ? formatCurrency(p.price) : "A definir"}
                                    </span>
                                    <button onClick={() => setEditingId(p.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => { config.removeProduct(p.id); toast.success("Produto removido"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ==================== PRODUTOS UPGRADE ==================== */}
              {activeTab === "upgrade" && (
                <div className="space-y-3">
                  {showForm && !editingId && (
                    <UpgradeProductForm
                      onSave={(p) => { config.addUpgradeProduct(p); setShowForm(false); toast.success("Produto de upgrade adicionado"); }}
                      onCancel={() => setShowForm(false)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{filteredUpgrade.length} produto(s) encontrado(s)</p>
                  {Array.from(upgradeByCategory.entries()).map(([cat, items]) => (
                    <div key={cat} className="border border-border rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(cat)} className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors">
                        <span className="text-xs font-semibold text-foreground">{cat} <span className="text-muted-foreground font-normal">({items.length})</span></span>
                        {expandedCategories.has(cat) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {expandedCategories.has(cat) && (
                        <div className="divide-y divide-border">
                          {items.map((p) => (
                            <div key={p.id}>
                              {editingId === p.id ? (
                                <div className="p-2">
                                  <UpgradeProductForm
                                    initial={p}
                                    onSave={(updated) => { config.updateUpgradeProduct(p.id, updated); setEditingId(null); toast.success("Produto atualizado"); }}
                                    onCancel={() => setEditingId(null)}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-between px-3 py-2 hover:bg-secondary/30 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary font-medium text-muted-foreground">{p.storage}</span>
                                    <span className="text-xs text-foreground">{p.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-semibold text-emerald-600">{formatCurrency(p.tradeInValue)}</span>
                                    <button onClick={() => setEditingId(p.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => { config.removeUpgradeProduct(p.id); toast.success("Produto removido"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ==================== ABATIMENTOS ==================== */}
              {activeTab === "abatimentos" && (
                <div className="space-y-3">
                  {showForm && !editingId && (
                    <DeductionForm
                      onSave={(d) => { config.addDeduction(d); setShowForm(false); toast.success("Abatimento adicionado"); }}
                      onCancel={() => setShowForm(false)}
                    />
                  )}
                  {(["estado", "bateria", "funcionalidade", "garantia"] as const).map((cat) => {
                    const items = config.conditionDeductions.filter(d => d.category === cat);
                    if (items.length === 0) return null;
                    const catLabels = { estado: "Estado Físico", bateria: "Saúde de Bateria", funcionalidade: "Funcionalidades", garantia: "Garantia" };
                    return (
                      <div key={cat} className="border border-border rounded-lg overflow-hidden">
                        <div className="px-3 py-2.5 bg-secondary/50">
                          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{catLabels[cat]}</span>
                        </div>
                        <div className="divide-y divide-border">
                          {items.map((d) => (
                            <div key={d.id}>
                              {editingId === d.id ? (
                                <div className="p-2">
                                  <DeductionForm
                                    initial={d}
                                    onSave={(updated) => { config.updateDeduction(d.id, updated); setEditingId(null); toast.success("Abatimento atualizado"); }}
                                    onCancel={() => setEditingId(null)}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-between px-3 py-2 hover:bg-secondary/30 transition-colors">
                                  <div>
                                    <span className="text-xs text-foreground font-medium">{d.label}</span>
                                    <p className="text-[10px] text-muted-foreground">{d.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-mono font-semibold ${d.defaultValue < 0 ? "text-emerald-600" : "text-red-500"}`}>
                                      {d.defaultValue < 0 ? "+" : "-"}R$ {Math.abs(d.defaultValue).toFixed(0)}
                                    </span>
                                    <button onClick={() => setEditingId(d.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => { config.removeDeduction(d.id); toast.success("Abatimento removido"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ==================== TAXAS ==================== */}
              {activeTab === "taxas" && (
                <div className="space-y-3">
                  {showForm && !editingId && (
                    <RateForm
                      onSave={(r) => {
                        const exists = config.installmentRates.find(x => x.installments === r.installments);
                        if (exists) { toast.error("Já existe uma taxa para esse número de parcelas"); return; }
                        config.addRate(r);
                        setShowForm(false);
                        toast.success("Taxa adicionada");
                      }}
                      onCancel={() => setShowForm(false)}
                    />
                  )}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="px-3 py-2.5 bg-secondary/50">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Taxas de Parcelamento</span>
                    </div>
                    <div className="divide-y divide-border">
                      {config.installmentRates.map((r) => (
                        <div key={r.installments}>
                          {editingId === `rate-${r.installments}` ? (
                            <div className="p-2">
                              <RateForm
                                initial={r}
                                onSave={(updated) => { config.updateRate(r.installments, updated); setEditingId(null); toast.success("Taxa atualizada"); }}
                                onCancel={() => setEditingId(null)}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between px-3 py-3 hover:bg-secondary/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-foreground w-8">{r.label}</span>
                                <span className="text-xs text-muted-foreground">Parcela = (Valor ÷ (1 − {(r.rate * 100).toFixed(3)}%)) ÷ {r.installments}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-bold text-primary">{(r.rate * 100).toFixed(3)}%</span>
                                <button onClick={() => setEditingId(`rate-${r.installments}`)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={() => { config.removeRate(r.installments); toast.success("Taxa removida"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Fórmula oficial:</strong> Parcela = (Valor ÷ (1 − taxa)) ÷ número de parcelas. Arredondar apenas o valor final para 2 casas decimais.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== CATEGORIAS ==================== */}
              {activeTab === "categorias" && (
                <div className="space-y-3">
                  {showForm && !editingId && (
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border space-y-3">
                      <CategoryForm
                        onSave={(c) => { config.addCategory(c); setShowForm(false); toast.success("Categoria adicionada"); }}
                        onCancel={() => setShowForm(false)}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Categorias organizam os produtos (ex: iPhones, MacBooks, iPads). Adicione novas categorias para expandir o catálogo.</p>
                  <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                    {config.productCategories.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-3 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{config.products.filter(p => p.productCategory === c.name).length} produtos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { config.removeCategory(c.id); toast.success("Categoria removida"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== TEXTO DO ORÇAMENTO ==================== */}
              {activeTab === "texto" && (
                <div className="space-y-4">
                  {/* Nome da Loja */}
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="w-4 h-4 text-primary" />
                      <label className="text-sm font-semibold text-foreground">Nome da Loja</label>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">Este nome aparece no cabeçalho do orçamento gerado ("📱 Orçamento – Sua Loja"). Se vazio, usa "Quotify".</p>
                    <input
                      type="text"
                      value={config.storeName}
                      onChange={(e) => config.setStoreName(e.target.value)}
                      placeholder="Ex: Tio Sam Imports"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    />
                  </div>

                  {/* Texto de Fechamento */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Texto de Fechamento do Orçamento</label>
                    <p className="text-[10px] text-muted-foreground mb-2">Este texto aparece no final do orçamento gerado para o cliente.</p>
                    <textarea
                      value={config.closingText}
                      onChange={(e) => config.setClosingText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
                      placeholder="O que achou dessa proposta?"
                    />
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                    <p className="text-xs font-medium text-foreground mb-2">Pré-visualização do orçamento:</p>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs space-y-1 whitespace-pre-wrap">
                      {`📱 Orçamento – ${config.storeName?.trim() || "Quotify"}\n\n📲 iPhone 16 Pro Max\n256GB • Titânio Natural • Lacrado\n💰 Valor do aparelho: \`R$ 9.499,00\`\n\nÀ vista no PIX: \`R$ 9.499,00\`\n\n💳 8x de \`R$ 1.313,90\`\n💳 10x de \`R$ 1.064,43\`\n💳 12x de \`R$ 898,30\`\n💳 18x de \`R$ 635,81\`\n\n${config.closingText}`}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== LOGO DA LOJA ==================== */}
              {activeTab === "logo" && (
                <LogoUploadTab />
              )}

              {/* ==================== TERMO DE GARANTIA ==================== */}
              {activeTab === "garantia" && (
                <WarrantyTab />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LOGO UPLOAD TAB ====================
function LogoUploadTab() {
  const config = useConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentLogo = previewUrl || config.logoUrl;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (PNG, JPG, WEBP)");
      return;
    }

    // Validar tamanho (max 1.5MB)
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("A imagem deve ter no m\u00e1ximo 1.5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        config.setLogoUrl(base64);
        toast.success("Logo atualizada com sucesso!");
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Erro ao ler a imagem");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Erro ao processar a imagem");
      setIsUploading(false);
    }

    // Limpar input para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [config]);

  const handleRemoveLogo = useCallback(() => {
    config.setLogoUrl(null);
    setPreviewUrl(null);
    toast.success("Logo removida");
  }, [config]);

  return (
    <div className="space-y-6">
      {/* Instru\u00e7\u00f5es */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ImagePlus className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Logo da Loja</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              A logo aparece no cabe\u00e7alho dos PDFs de or\u00e7amento e termo de garantia. 
              Recomendamos uma imagem quadrada (PNG ou JPG) com fundo transparente, at\u00e9 1.5MB.
            </p>
          </div>
        </div>
      </div>

      {/* \u00c1rea de Upload */}
      <div className="bg-card rounded-xl border border-border p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {currentLogo ? (
          <div className="flex flex-col items-center gap-4">
            {/* Preview da logo */}
            <div className="relative w-40 h-40 rounded-2xl border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden">
              <img
                src={currentLogo}
                alt="Logo da loja"
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            <p className="text-xs text-muted-foreground">Logo atual da loja</p>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Trocar Logo
              </button>
              <button
                onClick={handleRemoveLogo}
                className="px-4 py-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-4 py-10 cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">Clique para enviar a logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP \u2022 M\u00e1ximo 1.5MB</p>
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Enviando...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview nos PDFs */}
      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <p className="text-xs font-medium text-foreground mb-2">Onde a logo aparece:</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex items-center gap-2">\u2022 Cabe\u00e7alho do PDF de Or\u00e7amento</li>
          <li className="flex items-center gap-2">\u2022 Cabe\u00e7alho do Termo de Garantia</li>
          <li className="flex items-center gap-2">\u2022 Ao lado do nome da loja nos documentos</li>
        </ul>
      </div>
    </div>
  );
}

// ==================== WARRANTY TAB ====================
const DEFAULT_WARRANTY_TEXT = `1. COBERTURA DA GARANTIA
Esta garantia cobre defeitos de fabrica\u00e7\u00e3o e mau funcionamento de componentes internos do aparelho, incluindo:\n- Placa-m\u00e3e e processador\n- Tela (defeitos de pixels, touch fantasma)\n- Bateria (capacidade abaixo de 80% no per\u00edodo)\n- Bot\u00f5es f\u00edsicos e sensores\n- Alto-falantes e microfone\n- Conector de carga\n- C\u00e2meras (foco, estabiliza\u00e7\u00e3o)\n\n2. EXCLUS\u00d5ES DA GARANTIA\nA garantia N\u00c3O cobre:\n- Danos f\u00edsicos (quedas, impactos, press\u00e3o)\n- Danos por l\u00edquidos ou umidade\n- Mau uso ou negligencia\n- Modifica\u00e7\u00f5es n\u00e3o autorizadas (jailbreak, desbloqueio)\n- Desgaste natural (riscos cosm\u00e9ticos)\n- Acess\u00f3rios (capas, pel\u00edculas, carregadores)\n- Problemas de software (apps, atualiza\u00e7\u00f5es)\n\n3. CONDI\u00c7\u00d5ES\n- O aparelho deve ser apresentado nas mesmas condi\u00e7\u00f5es da compra\n- A garantia \u00e9 intransfer\u00edvel\n- O prazo para an\u00e1lise t\u00e9cnica \u00e9 de at\u00e9 30 dias \u00fateis\n- A loja reserva o direito de reparar, substituir ou reembolsar`;

function WarrantyTab() {
  const config = useConfig();
  const [localText, setLocalText] = useState(config.warrantyText || DEFAULT_WARRANTY_TEXT);
  const [localDays, setLocalDays] = useState(config.warrantyDays || 90);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = useCallback(() => {
    config.setWarrantyText(localText);
    config.setWarrantyDays(localDays);
    setHasChanges(false);
    toast.success("Configura\u00e7\u00f5es de garantia salvas!");
  }, [config, localText, localDays]);

  const handleReset = useCallback(() => {
    setLocalText(DEFAULT_WARRANTY_TEXT);
    setLocalDays(90);
    setHasChanges(true);
    toast.info("Texto restaurado para o padr\u00e3o. Clique em Salvar para confirmar.");
  }, []);

  return (
    <div className="space-y-6">
      {/* Instru\u00e7\u00f5es */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Termo de Garantia</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Configure o texto que aparece no PDF do Termo de Garantia. 
              Voc\u00ea pode personalizar as coberturas, exclus\u00f5es e condi\u00e7\u00f5es de acordo com a pol\u00edtica da sua loja.
            </p>
          </div>
        </div>
      </div>

      {/* Dias de Garantia */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold text-foreground">Prazo de Garantia (dias)</label>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          N\u00famero de dias de garantia padr\u00e3o para os aparelhos vendidos. Este valor aparece no Termo de Garantia.
        </p>
        <div className="flex items-center gap-3">
          {[30, 60, 90, 120, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() => { setLocalDays(d); setHasChanges(true); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                localDays === d
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {d} dias
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-[10px] text-muted-foreground mb-1 block">Ou digite um valor personalizado:</label>
          <input
            type="number"
            min={1}
            max={730}
            value={localDays}
            onChange={(e) => { setLocalDays(parseInt(e.target.value) || 90); setHasChanges(true); }}
            className="w-32 px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono"
          />
        </div>
      </div>

      {/* Texto da Garantia */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">Texto do Termo de Garantia</label>
          </div>
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar padr\u00e3o
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Personalize o texto que aparece no corpo do Termo de Garantia. Inclua coberturas, exclus\u00f5es e condi\u00e7\u00f5es.
        </p>
        <textarea
          value={localText}
          onChange={(e) => { setLocalText(e.target.value); setHasChanges(true); }}
          rows={16}
          className="w-full px-3 py-3 rounded-lg border border-input bg-background text-sm resize-y font-mono leading-relaxed"
          placeholder="Digite o texto do termo de garantia..."
        />
      </div>

      {/* Bot\u00e3o Salvar */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Configura\u00e7\u00f5es de Garantia
          </button>
        </div>
      )}

      {/* Preview */}
      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <p className="text-xs font-medium text-foreground mb-3">Pr\u00e9-visualiza\u00e7\u00e3o do Termo:</p>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-border text-xs space-y-2 whitespace-pre-wrap leading-relaxed">
          <div className="text-center border-b border-border pb-3 mb-3">
            <p className="text-sm font-bold text-foreground">{config.storeName || "Quotify"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">TERMO DE GARANTIA</p>
          </div>
          <p className="text-muted-foreground"><strong>Produto:</strong> iPhone 16 Pro Max 256GB</p>
          <p className="text-muted-foreground"><strong>Validade:</strong> {localDays} dias a partir da compra</p>
          <div className="border-t border-border pt-3 mt-3 text-muted-foreground">
            {localText || "(Nenhum texto configurado)"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CATEGORY FORM (inline) ====================
function CategoryForm({
  onSave,
  onCancel,
}: {
  onSave: (c: ProductCategory) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    onSave({
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: name.trim(),
      icon: "package",
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Categoria</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="MacBooks" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>
    </div>
  );
}
