import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart } from "lucide-react";
import type { CartItem } from "../hooks/useQueries";

interface HeaderProps {
  cartItems: CartItem[];
  onCartOpen: () => void;
}

export function Header({ cartItems, onCartOpen }: HeaderProps) {
  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm shadow-header border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            data-ocid="header.link"
            className="flex items-center gap-2.5 group"
            aria-label="A TO Z Store home"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-800 text-lg text-foreground tracking-tight">
                A TO Z
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground -mt-0.5">
                Store
              </span>
            </div>
          </a>

          {/* Store tagline — desktop only */}
          <p className="hidden md:block text-sm text-muted-foreground font-medium">
            Everything from A to Z, all in one place
          </p>

          {/* Cart button */}
          <Button
            variant="outline"
            size="icon"
            className="relative w-10 h-10 rounded-xl border-border hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={onCartOpen}
            data-ocid="header.cart_button"
            aria-label={`Open cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <Badge
                className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground border-0 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
