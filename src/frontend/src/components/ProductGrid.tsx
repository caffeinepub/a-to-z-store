import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

const SKELETON_KEYS = [
  "sk-0",
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
];

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void | Promise<void>;
  activeCategory: string;
  onProductClick: (product: Product) => void;
}

function ProductSkeleton() {
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden border border-border"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  onAddToCart,
  activeCategory,
  onProductClick,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
        aria-label="Loading products"
        data-ocid="products.loading_state"
      >
        {SKELETON_KEYS.map((key) => (
          <ProductSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
        data-ocid="products.empty_state"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
          <PackageSearch className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="font-display font-700 text-lg text-foreground">
            No products found
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCategory === "All"
              ? "No products available yet. Check back soon!"
              : `No products in the "${activeCategory}" category.`}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.ul
        key={activeCategory}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 list-none p-0 m-0"
        aria-label={`${activeCategory} products`}
      >
        {products.map((product, index) => (
          <li key={product.id.toString()} className="contents">
            <ProductCard
              product={product}
              index={index}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          </li>
        ))}
      </motion.ul>
    </AnimatePresence>
  );
}
