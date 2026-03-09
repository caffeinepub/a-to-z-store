import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { motion } from "motion/react";
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
  Keyrings: "bg-store-orange/10 text-store-orange",
  "Pencil Boxes": "bg-store-teal/10 text-store-teal",
  "Kids Folders": "bg-purple-100 text-purple-700",
  Perfumes: "bg-pink-100 text-pink-700",
  Cases: "bg-blue-100 text-blue-700",
  Bags: "bg-rose-100 text-rose-700",
};

interface ProductCardProps {
  product: Product;
  index: number;
  onProductClick: (product: Product) => void;
}

export function ProductCard({
  product,
  index,
  onProductClick,
}: ProductCardProps) {
  const imageUrl =
    product.imageUrl && product.imageUrl.trim() !== ""
      ? product.imageUrl
      : (CATEGORY_IMAGES[product.category] ??
        "/assets/generated/hero-banner.dim_1200x400.jpg");

  const displayPrice = `₹${(Number(product.price) / 100).toFixed(0)}`;
  const categoryColor =
    CATEGORY_COLORS[product.category] ?? "bg-muted text-muted-foreground";
  const isOutOfStock = Number(product.stock) === 0;
  const isBagProduct = product.category === "Bags";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border flex flex-col"
      data-ocid={`product.item.${index + 1}`}
    >
      {/* Product image */}
      <button
        type="button"
        className="relative overflow-hidden aspect-[4/3] bg-muted w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => onProductClick(product)}
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-foreground text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {isBagProduct && (
          <div className="absolute top-2 right-2">
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              New
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/10 transition-colors flex items-end justify-center pb-2 opacity-0 hover:opacity-100">
          <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1">
            <Eye className="w-3 h-3" /> View Details
          </span>
        </div>
      </button>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span
          className={`self-start text-xs font-bold px-2.5 py-0.5 rounded-full ${categoryColor}`}
        >
          {product.category}
        </span>

        <button
          type="button"
          className="font-display font-700 text-base text-foreground leading-snug line-clamp-2 flex-1 cursor-pointer hover:text-primary transition-colors text-left bg-transparent border-0 p-0 m-0"
          onClick={() => onProductClick(product)}
        >
          {product.name}
        </button>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="price-tag text-xl text-primary">{displayPrice}</span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl font-bold gap-1.5 text-xs px-3 h-8"
            onClick={() => onProductClick(product)}
            data-ocid={`product.primary_button.${index + 1}`}
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
