import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { useRef, useState } from "react";
import { CategoryTabs } from "./components/CategoryTabs";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductGrid } from "./components/ProductGrid";
import { SearchBar } from "./components/SearchBar";
import { useProducts } from "./hooks/useQueries";
import type { Product } from "./hooks/useQueries";

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="font-bold text-xl text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              The app ran into an error. Please refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Store ────────────────────────────────────────────────────────────────────
function Store() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);

  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  const categoryFiltered =
    activeCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = trimmedQuery
    ? categoryFiltered.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.description.toLowerCase().includes(trimmedQuery),
      )
    : categoryFiltered;

  const handleShopNow = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <HeroBanner onShopNow={handleShopNow} />

        <div ref={productsRef}>
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredProducts.length}
            isSearching={trimmedQuery.length > 0}
          />

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="font-display font-700 text-2xl text-foreground">
                  {trimmedQuery
                    ? `Results for "${searchQuery.trim()}"`
                    : activeCategory === "All"
                      ? "All Products"
                      : activeCategory}
                </h2>
                {!productsLoading && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </div>

            <ProductGrid
              products={filteredProducts}
              isLoading={productsLoading}
              activeCategory={activeCategory}
              onProductClick={setSelectedProduct}
            />
          </section>
        </div>
      </main>

      <Footer onCategorySelect={handleCategorySelect} />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Store />
    </ErrorBoundary>
  );
}
