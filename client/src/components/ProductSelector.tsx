/**
 * ProductSelector — Seletor de produto para compra
 * Suporta filtro por productCategory (iPhones, iPads, etc.), condição (novo/seminovo) e busca
 * Inclui edição inline de preço: ao clicar no preço, abre um campo para editar
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { Product, getProductCategories, formatCurrency } from "@/lib/data";
import {
  Search,
  Smartphone,
  Tablet,
  Watch,
  Laptop,
  Headphones,
  Check,
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iPhones: Smartphone,
  iPads: Tablet,
  "Apple Watch": Watch,
  MacBooks: Laptop,
  "Acessórios": Headphones,
};

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
  onUpdatePrice?: (productId: string, newPrice: number) => void;
}

/**
 * Inline price editor component
 */
function InlinePriceEditor({
  productId,
  currentPrice,
  onSave,
  onCancel,
  isSelectedRow,
}: {
  productId: string;
  currentPrice: number;
  onSave: (productId: string, price: number) => void;
  onCancel: () => void;
  isSelectedRow?: boolean;
}) {
  const [value, setValue] = useState(currentPrice > 0 ? currentPrice.toFixed(2).replace(".", ",") : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const readyRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    // Focus and select all text on mount with a delay to ensure DOM is stable
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      readyRef.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    // Ignore blur events before the input is ready or if already saved
    if (!readyRef.current || savedRef.current) return;
    savedRef.current = true;
    const cleaned = value.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0) {
      onSave(productId, num);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="flex items-center gap-1 shrink-0 ml-2"
      onClick={(e) => e.stopPropagation()}
    >
      <span className={`text-[10px] font-medium ${isSelectedRow ? "text-primary-foreground/70" : "text-muted-foreground"}`}>R$</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Allow only numbers, comma, and dot
          const v = e.target.value.replace(/[^0-9.,]/g, "");
          setValue(v);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className={`w-20 px-1.5 py-0.5 text-xs font-mono font-semibold rounded border text-right ${
          isSelectedRow
            ? "bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50"
            : "bg-background border-input text-foreground placeholder:text-muted-foreground"
        } focus:outline-none focus:ring-1 focus:ring-primary/50`}
        placeholder="0,00"
      />
    </div>
  );
}

/**
 * Selected product card with inline price editing
 * Uses a separate component to isolate state and prevent focus issues
 */
function SelectedProductCard({
  product,
  onUpdatePrice,
  onPriceSave,
}: {
  product: Product;
  onUpdatePrice?: (productId: string, newPrice: number) => void;
  onPriceSave: (productId: string, newPrice: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [priceValue, setPriceValue] = useState(
    product.price > 0 ? product.price.toFixed(2).replace(".", ",") : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  // Update priceValue when product changes
  useEffect(() => {
    if (!isEditing) {
      setPriceValue(product.price > 0 ? product.price.toFixed(2).replace(".", ",") : "");
    }
  }, [product.price, isEditing]);

  const openEditor = () => {
    if (!onUpdatePrice) return;
    setIsEditing(true);
    savingRef.current = false;
    // Focus will be set by the useEffect below
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const cleaned = priceValue.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0) {
      onPriceSave(product.id, num);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPriceValue(product.price > 0 ? product.price.toFixed(2).replace(".", ",") : "");
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {product.storage !== "-" && product.storage}
            {product.color && ` \u2022 ${product.color}`}
            {product.specs && ` \u2022 ${product.specs}`}
            {" \u2022 "}
            <span className={product.condition === "novo" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
              {product.condition === "novo" ? "Lacrado" : "Seminovo"}
            </span>
          </p>
        </div>
      </div>
      {isEditing ? (
        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-medium text-muted-foreground">R$</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={priceValue}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.,]/g, "");
              setPriceValue(v);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-24 px-1.5 py-0.5 text-sm font-mono font-semibold rounded border bg-background border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-right"
            placeholder="0,00"
          />
        </div>
      ) : (
        <button
          onClick={openEditor}
          className="group flex items-center gap-1.5 font-mono text-base font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
          title="Clique para editar o preço"
        >
          {product.price > 0 ? formatCurrency(product.price) : "A definir"}
          {onUpdatePrice && <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary/60" />}
        </button>
      )}
    </div>
  );
}

export default function ProductSelector({ products, selectedProduct, onSelect, onUpdatePrice }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeProductCategory, setActiveProductCategory] = useState<string>("iPhones");
  const [conditionFilter, setConditionFilter] = useState<"all" | "novo" | "seminovo">("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Categorias de produto disponíveis
  const productCategories = useMemo(() => {
    const cats = Array.from(new Set((products || []).map((p) => p.productCategory)));
    return cats.sort((a, b) => {
      const order = ["iPhones", "iPads", "Apple Watch", "MacBooks", "Acessórios"];
      return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
    });
  }, [products]);

  const filtered = useMemo(() => {
    let list = products || [];
    // Filtrar por productCategory
    list = list.filter((p) => p.productCategory === activeProductCategory);
    if (conditionFilter !== "all") {
      list = list.filter((p) => p.condition === conditionFilter);
    }
    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storage.toLowerCase().includes(q) ||
          (p.color && p.color.toLowerCase().includes(q)) ||
          (p.specs && p.specs.toLowerCase().includes(q))
      );
    }
    // Produtos com preço primeiro
    return list.sort((a, b) => {
      if (a.price > 0 && b.price === 0) return -1;
      if (a.price === 0 && b.price > 0) return 1;
      return 0;
    });
  }, [products, search, activeCategory, activeProductCategory, conditionFilter]);

  const categories = useMemo(() => getProductCategories(filtered), [filtered]);

  // Verificar se a productCategory atual tem seminovos
  const hasConditions = useMemo(() => {
    const list = (products || []).filter((p) => p.productCategory === activeProductCategory);
    const hasNovo = list.some((p) => p.condition === "novo");
    const hasSeminovo = list.some((p) => p.condition === "seminovo");
    return { hasNovo, hasSeminovo, hasBoth: hasNovo && hasSeminovo };
  }, [products, activeProductCategory]);

  // Agrupar por category
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = p.category;
      const arr = map.get(key) || [];
      arr.push(p);
      map.set(key, arr);
    }
    return map;
  }, [filtered]);

  const toggleCollapse = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handlePriceSave = (productId: string, newPrice: number) => {
    if (onUpdatePrice) {
      onUpdatePrice(productId, newPrice);
      // Also update the selected product if it's the one being edited
      // Only call onSelect if the price actually changed to avoid unnecessary re-renders
      if (selectedProduct && selectedProduct.id === productId && selectedProduct.price !== newPrice) {
        onSelect({ ...selectedProduct, price: newPrice });
      }
    }
    setEditingProductId(null);
  };

  const handlePriceClick = (e: React.MouseEvent, productId: string) => {
    if (!onUpdatePrice) return;
    e.stopPropagation();
    setEditingProductId(productId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Produto para Compra</h2>
        </div>
        {selectedProduct && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-destructive/5"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {/* Produto selecionado */}
      {selectedProduct && (
        <SelectedProductCard
          product={selectedProduct}
          onUpdatePrice={onUpdatePrice}
          onPriceSave={handlePriceSave}
        />
      )}

      {/* Filtro por categoria de produto (iPhones, iPads, etc.) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {productCategories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Package;
          const isActive = activeProductCategory === cat;
          const count = (products || []).filter((p) => p.productCategory === cat).length;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveProductCategory(cat);
                setActiveCategory(null);
                setConditionFilter("all");
                setExpandedCategories(new Set());
                setEditingProductId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat}
              <span className={`text-[9px] px-1 py-0.5 rounded ${isActive ? "bg-primary-foreground/20" : "bg-background/50"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtro de condição (só mostra se tem ambas) */}
      {hasConditions.hasBoth && (
        <div className="flex gap-1 p-0.5 bg-secondary rounded-lg w-fit">
          {(["all", "seminovo", "novo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setConditionFilter(f);
                setActiveCategory(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                conditionFilter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "novo" ? "Lacrados" : "Seminovos"}
            </button>
          ))}
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Buscar em ${activeProductCategory}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
        />
      </div>

      {/* Filtros de modelo (subcategoria) */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              !activeCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Lista de produtos agrupados */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCollapse(category)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                {category}{" "}
                <span className="text-muted-foreground font-normal normal-case">({items.length})</span>
              </span>
              {expandedCategories.has(category) ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {expandedCategories.has(category) && (
              <div className="divide-y divide-border">
                {items.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  const isEditing = editingProductId === product.id;
                  return (
                    <div
                      key={product.id}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      } ${isEditing ? "" : "cursor-pointer active:scale-[0.99]"}`}
                      onClick={() => {
                        if (!isEditing) {
                          onSelect(isSelected ? null : product);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {product.storage !== "-" && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {product.storage}
                          </span>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-medium">{product.name}</span>
                          {product.specs && (
                            <span className={`text-[10px] ml-1.5 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              • {product.specs}
                            </span>
                          )}
                        </div>
                        {product.condition === "novo" && (
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            LACRADO
                          </span>
                        )}
                        {product.condition === "seminovo" && (
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            SEMI
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <InlinePriceEditor
                          productId={product.id}
                          currentPrice={product.price}
                          onSave={handlePriceSave}
                          onCancel={() => setEditingProductId(null)}
                          isSelectedRow={isSelected}
                        />
                      ) : (
                        <span
                          onClick={(e) => handlePriceClick(e, product.id)}
                          className={`group font-mono text-xs font-semibold shrink-0 ml-2 inline-flex items-center gap-1 ${
                            onUpdatePrice ? "cursor-pointer hover:underline" : ""
                          } ${
                            isSelected
                              ? "text-primary-foreground"
                              : product.price > 0
                              ? "text-foreground"
                              : "text-amber-500"
                          }`}
                          title={onUpdatePrice ? "Clique para editar o preço" : undefined}
                        >
                          {product.price > 0 ? formatCurrency(product.price) : "A definir"}
                          {onUpdatePrice && (
                            <Pencil className={`w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity ${
                              isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                            }`} />
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
