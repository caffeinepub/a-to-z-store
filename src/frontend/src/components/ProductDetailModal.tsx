import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Tag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
}

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  if (!product) return null;

  const imageUrl =
    product.imageUrl && product.imageUrl.trim() !== ""
      ? product.imageUrl
      : (CATEGORY_IMAGES[product.category] ??
        "/assets/generated/hero-banner.dim_1200x400.jpg");

  const actualPrice = Number(product.price) / 100;
  const mrp = Math.ceil((actualPrice * 1.25) / 10) * 10;
  const discountPct = Math.round((1 - actualPrice / mrp) * 100);
  const isOutOfStock = Number(product.stock) === 0;
  const categoryColor =
    CATEGORY_COLORS[product.category] ??
    "bg-muted text-muted-foreground border-border";

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
            {/* Hero image */}
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
              {/* Category + rating */}
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

              <h2 className="font-display font-700 text-xl sm:text-2xl text-foreground leading-tight">
                {product.name}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description ||
                  `Premium quality ${product.category.toLowerCase()} crafted with care. Perfect for everyday use and gifting.`}
              </p>

              <div className="border-t border-border" />

              {/* Pricing */}
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
                <span className="bg-green-500/15 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg mb-0.5">
                  You save ₹{(mrp - actualPrice).toFixed(0)}
                </span>
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

              {/* Instagram CTA */}
              <a
                href="https://www.instagram.com/a2z.megastore"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white hover:opacity-90 transition-opacity mt-1"
                data-ocid="product.modal.primary_button"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Order via Instagram @a2z.megastore
              </a>

              <p className="text-center text-xs text-muted-foreground">
                DM us on Instagram to place your order
              </p>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
