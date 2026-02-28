/**
 * ProductSelector — Seletor de produto para compra
 * Suporta filtro por condição (novo/seminovo) e categorias dinâmicas
 */
import { useState, useMemo } from "react";
import { Product, getProductCategories, formatCurrency } from "@/lib/data";
import { Search, Smartphone, Check, X, Package } from "lucide-react";

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
}

export default function ProductSelector({ products, selectedProduct, onSelect }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<"all" | "novo" | "seminovo">("all");

  const filtered = useMemo(() => {
    let list = products || [];
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
          (p.color && p.color.toLowerCase().includes(q))
      );
    }
    // Filtrar produtos com preço definido primeiro, depois os sem preço
    return list.sort((a, b) => {
      if (a.price > 0 && b.price === 0) return -1;
      if (a.price === 0 && b.price > 0) return 1;
      return 0;
    });
  }, [products, search, activeCategory, conditionFilter]);

  const categories = useMemo(() => getProductCategories(filtered), [filtered]);

  // Agrupar por categoria
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
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{selectedProduct.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedProduct.storage}
                {selectedProduct.color && ` • ${selectedProduct.color}`}
                {" • "}
                <span className={selectedProduct.condition === "novo" ? "text-emerald-600" : "text-blue-600"}>
                  {selectedProduct.condition === "novo" ? "Lacrado" : "Seminovo"}
                </span>
              </p>
            </div>
          </div>
          <span className="font-mono text-base font-bold text-primary">
            {selectedProduct.price > 0 ? formatCurrency(selectedProduct.price) : "A definir"}
          </span>
        </div>
      )}

      {/* Filtro de condição */}
      <div className="flex gap-1 p-0.5 bg-secondary rounded-lg w-fit">
        {(["all", "seminovo", "novo"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setConditionFilter(f); setActiveCategory(null); }}
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

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
        />
      </div>

      {/* Filtros de modelo */}
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
            {cat.replace("iPhone ", "")}
          </button>
        ))}
      </div>

      {/* Lista de produtos */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {category}
            </h3>
            <div className="grid gap-1.5">
              {items.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => onSelect(isSelected ? null : product)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all active:scale-[0.99] ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card hover:bg-accent border border-border hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {product.storage}
                      </span>
                      <span className="text-sm font-medium">{product.name}</span>
                      {product.condition === "novo" && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          LACRADO
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-sm font-semibold ${
                      isSelected ? "text-primary-foreground" : product.price > 0 ? "text-foreground" : "text-amber-500"
                    }`}>
                      {product.price > 0 ? formatCurrency(product.price) : "A definir"}
                    </span>
                  </button>
                );
              })}
            </div>
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
