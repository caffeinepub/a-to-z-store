import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { CartItem, Product } from "../hooks/useQueries";
import { CheckoutDialog } from "./CheckoutDialog";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: bigint, quantity: bigint) => Promise<void>;
  onRemoveItem: (productId: bigint) => Promise<void>;
  onClearCart: () => Promise<void>;
}

export function CartSheet({
  open,
  onOpenChange,
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartSheetProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  const productMap = new Map<string, Product>(
    products.map((p) => [p.id.toString(), p]),
  );

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId.toString());
    if (!product) return sum;
    return sum + Number(product.price) * Number(item.quantity);
  }, 0);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );

  const handleQuantityChange = async (
    productId: bigint,
    delta: number,
    currentQty: number,
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    const key = productId.toString();
    setUpdatingId(key);
    try {
      await onUpdateQuantity(productId, BigInt(newQty));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: bigint) => {
    const key = productId.toString();
    setRemovingId(key);
    try {
      await onRemoveItem(productId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    setClearingCart(true);
    try {
      await onClearCart();
    } finally {
      setClearingCart(false);
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col gap-0"
          data-ocid="cart.sheet"
        >
          <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display font-700 text-xl flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
                {totalItems > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </span>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg"
                onClick={() => onOpenChange(false)}
                data-ocid="cart.close_button"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-700 text-lg text-foreground">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add some products to get started!
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-5 py-3">
                <div className="flex flex-col gap-3">
                  {cartItems.map((item, index) => {
                    const product = productMap.get(item.productId.toString());
                    if (!product) return null;
                    const qty = Number(item.quantity);
                    const itemTotal = (
                      (Number(product.price) * qty) /
                      100
                    ).toFixed(0);
                    const isUpdating = updatingId === item.productId.toString();
                    const isRemoving = removingId === item.productId.toString();

                    return (
                      <div
                        key={item.productId.toString()}
                        className="flex gap-3 p-3 bg-muted/40 rounded-xl"
                        data-ocid={`cart.item.${index + 1}`}
                      >
                        {/* Product image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-card">
                          <img
                            src={
                              product.imageUrl && product.imageUrl.trim() !== ""
                                ? product.imageUrl
                                : `/assets/generated/${product.category.toLowerCase().replace(" ", "-").replace(" ", "-")}s.dim_400x300.jpg`
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground leading-snug truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.category}
                          </p>
                          <p className="price-tag text-sm text-primary mt-1">
                            ₹{itemTotal}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-6 h-6 rounded-lg p-0"
                              onClick={() =>
                                handleQuantityChange(item.productId, -1, qty)
                              }
                              disabled={isUpdating || qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </Button>
                            <span className="text-sm font-bold min-w-[1.5rem] text-center">
                              {qty}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-6 h-6 rounded-lg p-0"
                              onClick={() =>
                                handleQuantityChange(item.productId, 1, qty)
                              }
                              disabled={isUpdating}
                              aria-label="Increase quantity"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemove(item.productId)}
                          disabled={isRemoving}
                          data-ocid={`cart.delete_button.${index + 1}`}
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <SheetFooter className="flex flex-col gap-3 px-5 py-4 border-t border-border shrink-0">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Subtotal
                  </span>
                  <span className="price-tag text-xl text-foreground">
                    ₹{(totalPrice / 100).toFixed(0)}
                  </span>
                </div>

                <Separator />

                {/* Actions */}
                <Button
                  className="w-full rounded-xl font-bold h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setCheckoutOpen(true)}
                  data-ocid="cart.checkout_button"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-xl font-semibold h-9 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={handleClearCart}
                  disabled={clearingCart}
                  data-ocid="cart.delete_button"
                >
                  {clearingCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Clearing...
                    </>
                  ) : (
                    "Clear Cart"
                  )}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cartItems={cartItems}
        products={products}
        totalPrice={totalPrice}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
}
