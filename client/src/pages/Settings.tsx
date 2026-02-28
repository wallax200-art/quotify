/**
 * Settings — Página de Configurações — Tio Sam Imports
 * CRUD completo para: Produtos, Upgrade, Abatimentos, Taxas, Categorias, Texto
 * Design: Tech Workspace
 */
import { useState, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

type SettingsTab = "produtos" | "upgrade" | "abatimentos" | "taxas" | "categorias" | "texto";

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "produtos", label: "Produtos à Venda", icon: Package },
  { id: "upgrade", label: "Produtos Upgrade", icon: ArrowLeftRight },
  { id: "abatimentos", label: "Abatimentos", icon: AlertTriangle },
  { id: "taxas", label: "Taxas de Parcelamento", icon: Percent },
  { id: "categorias", label: "Categorias", icon: FolderOpen },
  { id: "texto", label: "Texto do Orçamento", icon: MessageSquare },
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
  const [activeTab, setActiveTab] = useState<SettingsTab>("produtos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<"all" | "novo" | "seminovo">("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // ==================== PRODUTOS À VENDA ====================
  const filteredProducts = useMemo(() => {
    let items = config.products;
    if (conditionFilter !== "all") items = items.filter(p => p.condition === conditionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.storage.toLowerCase().includes(q) || (p.color && p.color.toLowerCase().includes(q)));
    }
    return items;
  }, [config.products, search, conditionFilter]);

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
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <SettingsIcon className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">Configurações</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Tio Sam Imports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de navegação */}
          <div className="lg:w-56 shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setShowForm(false); setEditingId(null); setSearch(""); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
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
                  {activeTab !== "categorias" && activeTab !== "texto" && (
                    <button onClick={handleResetTab} className="px-2.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1" title="Restaurar padrão">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restaurar</span>
                    </button>
                  )}
                  {activeTab !== "texto" && (
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
                        {collapsedCategories.has(cat) ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {!collapsedCategories.has(cat) && (
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
                        {collapsedCategories.has(cat) ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {!collapsedCategories.has(cat) && (
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
                      {"📱 Orçamento – Tio Sam Imports\n\n📲 iPhone 16 Pro Max\n256GB • Titânio Natural • Lacrado\n💰 Valor do aparelho: `R$ 9.499,00`\n\nÀ vista no PIX: `R$ 9.499,00`\n\n💳 8x de `R$ 1.313,90`\n💳 10x de `R$ 1.064,43`\n💳 12x de `R$ 898,30`\n💳 18x de `R$ 635,81`\n\n" + config.closingText}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
