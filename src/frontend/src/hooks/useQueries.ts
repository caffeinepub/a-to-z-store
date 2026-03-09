import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { CartItem, Order, Product, UserProfile } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Product, CartItem, Order, UserProfile };

// All products are defined statically in the frontend so they always show
// without requiring backend auth or admin seeding
export const STATIC_PRODUCTS: Product[] = [
  {
    id: BigInt(101),
    name: "Sparkling Mini Spray Perfume Bottle - Black",
    description:
      "Stunning black rhinestone mini spray perfume bottle with rainbow keyring. Compact and portable with glittering crystal finish — perfect for travel.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-black-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(102),
    name: "Sparkling Mini Spray Perfume Bottle - Blue",
    description:
      "Beautiful sky blue rhinestone mini spray perfume bottle with rainbow keyring. Sparkly crystal cover keeps your perfume safe and stylish.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-blue-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(103),
    name: "Sparkling Mini Spray Perfume Bottle - Pink",
    description:
      "Pretty pink rhinestone mini spray perfume bottle with rainbow keyring. Full crystal wrap with gold hardware accents.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-pink-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(104),
    name: "Sparkling Mini Spray Perfume Bottle - Red",
    description:
      "Bold red rhinestone mini spray perfume bottle with rainbow keyring. Eye-catching crystal design with premium gold ring.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-red-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(105),
    name: "Sparkling Mini Spray Perfume Bottle - Silver",
    description:
      "Elegant silver diamond rhinestone mini spray perfume bottle with rainbow keyring. Luxurious all-over crystal finish.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-silver-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(106),
    name: "Sparkling Mini Spray Perfume Bottle - Purple",
    description:
      "Gorgeous purple rhinestone mini spray perfume bottle with rainbow keyring. Vibrant crystal coating with sparkling AB finish.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Sparkling Mini Spray Perfume Bottles",
    imageUrl: "/assets/generated/perfume-purple-cropped.dim_600x600.jpg",
  },
  {
    id: BigInt(107),
    name: "Cute Mini Magnetic Writing Board Keychain",
    description:
      "Adorable mini magnetic writing board keychain with cute bunny character design. Comes with stylus pen and bell charm — perfect for notes on the go!",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Keychains",
    imageUrl:
      "/assets/generated/keychain-writing-board-cropped.dim_800x800.jpg",
  },
  {
    id: BigInt(108),
    name: "Soft Mochi Kuromi Squishy Toy",
    description:
      "Super soft and squishy Kuromi mochi toy — the popular kawaii cartoon character in a cute plump squishy form with fluffy pom-pom details. Slow-rising and satisfying to squeeze! Perfect for stress relief and gifting.",
    price: BigInt(0),
    stock: BigInt(99),
    category: "Squishy Toys",
    imageUrl: "/assets/generated/kuromi-mochi-squishy-product.dim_800x800.jpg",
  },
];

export const STATIC_PRODUCT_IDS = new Set(
  STATIC_PRODUCTS.map((p) => p.id.toString()),
);

const CART_STORAGE_KEY = "atoz_cart";

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      productId: string;
      quantity: string;
    }>;
    return parsed.map((item) => ({
      productId: BigInt(item.productId),
      quantity: BigInt(item.quantity),
    }));
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    const serialisable = items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity.toString(),
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serialisable));
  } catch {
    // ignore storage errors
  }
}

export function useLocalCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadCartFromStorage(),
  );

  // Persist on every change
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((productId: bigint, quantity: bigint) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId.toString() === productId.toString(),
      );
      if (existing) {
        return prev.map((item) =>
          item.productId.toString() === productId.toString()
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: bigint, quantity: bigint) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId.toString() === productId.toString()
          ? { ...item, quantity }
          : item,
      ),
    );
  }, []);

  const removeFromCart = useCallback((productId: bigint) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productId.toString() !== productId.toString()),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return { cartItems, addToCart, updateQuantity, removeFromCart, clearCart };
}

export function useProducts() {
  // Always return static products immediately — no backend dependency
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => [...STATIC_PRODUCTS],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (category === "All") return [...STATIC_PRODUCTS];
      return STATIC_PRODUCTS.filter((p) => p.category === category);
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updateCartQuantity(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<bigint> => {
      if (!actor) throw new Error("Actor not ready");
      const orderId = await actor.placeOrder();
      await actor.clearCart();
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveCallerUserProfile(profile);
    },
  });
}
