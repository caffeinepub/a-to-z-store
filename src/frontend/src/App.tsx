import { Toaster } from "@/components/ui/sonner";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { CartSheet } from "./components/CartSheet";
import { CategoryTabs } from "./components/CategoryTabs";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductGrid } from "./components/ProductGrid";
import { SearchBar } from "./components/SearchBar";
import { useLocalCart, useProducts } from "./hooks/useQueries";
import type { Product } from "./hooks/useQueries";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);

  // Data queries
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  // Local cart — no backend dependency, works for any visitor
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart } =
    useLocalCart();

  // Filter products by category, then by search query
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

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product.id, BigInt(1));
      setCartOpen(true);
      toast.success(`${product.name} added to cart!`, {
        description: `₹${(Number(product.price) / 100).toFixed(0)}`,
      });
    },
    [addToCart],
  );

  const handleUpdateQuantity = useCallback(
    async (productId: bigint, quantity: bigint) => {
      updateQuantity(productId, quantity);
    },
    [updateQuantity],
  );

  const handleRemoveFromCart = useCallback(
    async (productId: bigint) => {
      removeFromCart(productId);
      toast.success("Item removed from cart");
    },
    [removeFromCart],
  );

  const handleClearCart = useCallback(async () => {
    clearCart();
    toast.success("Cart cleared");
  }, [clearCart]);

  const handleShopNow = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <Header cartItems={cartItems} onCartOpen={() => setCartOpen(true)} />

      <main className="flex-1">
        {/* Hero */}
        <HeroBanner onShopNow={handleShopNow} />

        {/* Products section */}
        <div ref={productsRef}>
          {/* Category filter */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredProducts.length}
            isSearching={trimmedQuery.length > 0}
          />

          {/* Product grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Section header */}
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
              onAddToCart={handleAddToCart}
              activeCategory={activeCategory}
              onProductClick={setSelectedProduct}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer onCategorySelect={handleCategorySelect} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cartItems={cartItems}
        products={allProducts}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
