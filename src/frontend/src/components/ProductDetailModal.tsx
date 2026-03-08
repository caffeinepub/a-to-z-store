import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShoppingCart, Star, Tag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../hooks/useQueries";

const CATEGORY_IMAGES: Record<string, string> = {
  Keyrings: "/assets/generated/keyrings.dim_400x300.jpg",
  "Pencil Boxes": "/assets/generated/pencil-boxes.dim_400x300.jpg",
  "Kids Folders": "/assets/generated/kids-folders.dim_400x300.jpg",
  Perfumes: "/assets/generated/perfumes.dim_400x300.jpg",
  Cases: "/assets/generated/cases.dim_400x300.jpg",
  Bags: "/assets/uploads/Screenshot_20260309_015648_WhatsApp-1.jpg",
};

const CATEGORY_COLORS: Record<string, string> = {
  Keyrings: "bg-store-orange/15 text-store-orange border-store-orange/30",
  "Pencil Boxes": "bg-store-teal/15 text-store-teal border-store-teal/30",
  "Kids Folders": "bg-purple-100 text-purple-700 border-purple-200",
  Perfumes: "bg-pink-100 text-pink-700 border-pink-200",
  Cases: "bg-blue-100 text-blue-700 border-blue-200",
  Bags: "bg-rose-100 text-rose-700 border-rose-200",
};

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void | Promise<void>;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const imageUrl =
    product.imageUrl && product.imageUrl.trim() !== ""
      ? product.imageUrl
      : (CATEGORY_IMAGES[product.category] ??
        "/assets/generated/hero-banner.dim_1200x400.jpg");

  const actualPrice = Number(product.price) / 100;
  // Calculate MRP: 25% higher, rounded to nearest 10
  const mrp = Math.ceil((actualPrice * 1.25) / 10) * 10;
  const discountPct = Math.round((1 - actualPrice / mrp) * 100);
  const isOutOfStock = Number(product.stock) === 0;
  const categoryColor =
    CATEGORY_COLORS[product.category] ??
    "bg-muted text-muted-foreground border-border";

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    try {
      await onAddToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-2xl w-[95vw] sm:w-full overflow-hidden rounded-2xl border-border bg-card shadow-2xl"
        data-ocid="product.modal"
      >
        {/* Custom close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors backdrop-blur-sm"
          data-ocid="product.modal.close_button"
          aria-label="Close product details"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <ScrollArea className="max-h-[90vh]">
          <div className="flex flex-col">
            {/* Hero image area */}
            <div
              className="relative overflow-hidden bg-muted"
              style={{ aspectRatio: "16/9" }}
            >
              <motion.img
                key={product.id.toString()}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Discount badge — top left */}
              <AnimatePresence>
                {!isOutOfStock && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-3 left-3"
                  >
                    <span className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <Tag className="w-3 h-3" />
                      {discountPct}% OFF
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="bg-card text-foreground text-sm font-bold px-4 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="p-5 sm:p-6 flex flex-col gap-4"
            >
              {/* Category badge + rating */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryColor}`}
                >
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <Star className="w-3.5 h-3.5 fill-amber-400/40 text-amber-400" />
                  <span className="text-xs text-muted-foreground ml-1">
                    4.2 (38 reviews)
                  </span>
                </div>
              </div>

              {/* Product name */}
              <h2 className="font-display font-700 text-xl sm:text-2xl text-foreground leading-tight">
                {product.name}
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description ||
                  `Premium quality ${product.category.toLowerCase()} crafted with care. Perfect for everyday use and gifting. Made with durable materials that ensure long-lasting use.`}
              </p>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Pricing block */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider font-medium">
                    Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      ₹{actualPrice.toFixed(0)}
                    </span>
                    <span className="text-base text-muted-foreground line-through">
                      ₹{mrp.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pb-0.5">
                  <span className="bg-green-500/15 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    You save ₹{(mrp - actualPrice).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-destructive" : "bg-green-500"}`}
                />
                <span
                  className={`text-sm font-medium ${isOutOfStock ? "text-destructive" : "text-green-700"}`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : Number(product.stock) < 10
                      ? `Only ${Number(product.stock)} left in stock — order soon!`
                      : "In Stock — Ready to Ship"}
                </span>
              </div>

              {/* Add to cart CTA */}
              <Button
                size="lg"
                className={`w-full h-12 rounded-xl font-bold text-base gap-2 transition-all mt-1
                  ${
                    justAdded
                      ? "bg-green-500 hover:bg-green-500 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                data-ocid="product.modal.primary_button"
                aria-label={`Add ${product.name} to cart`}
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {isAdding
                  ? "Adding..."
                  : justAdded
                    ? "Added to Cart!"
                    : isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
              </Button>

              {/* Delivery note */}
              <p className="text-center text-xs text-muted-foreground">
                🚚 Free delivery within Delhi · ₹120 delivery for rest of India
              </p>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
