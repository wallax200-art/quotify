/**
 * ProductSelector — Seletor de produto para compra
 * Design: Tech Workspace — cards com hover, badges de storage, busca
 */
import { useState, useMemo } from "react";
import { Product, PRODUCTS, getProductCategories, formatCurrency } from "@/lib/data";
import { Search, Smartphone, Check, X } from "lucide-react";

interface ProductSelectorProps {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
}

export default function ProductSelector({ selectedProduct, onSelect }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = useMemo(() => getProductCategories(PRODUCTS), []);

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.storage.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  // Agrupar por categoria
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
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
              <p className="text-xs text-muted-foreground">{selectedProduct.storage}</p>
            </div>
          </div>
          <span className="money-value text-primary text-base">
            {formatCurrency(selectedProduct.price)}
          </span>
        </div>
      )}

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

      {/* Filtros de categoria */}
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

      {/* Lista de produtos */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
        {Array.from(grouped.entries()).map(([category, products]) => (
          <div key={category}>
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {category}
            </h3>
            <div className="grid gap-1.5">
              {products.map((product) => {
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
                    <div className="flex items-center gap-3">
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
                    </div>
                    <span className={`money-value text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {formatCurrency(product.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum produto encontrado
          </div>
        )}
      </div>
    </div>
  );
}
