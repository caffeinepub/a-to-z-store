import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { CartItem, Order, Product, UserProfile } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Product, CartItem, Order, UserProfile };

// All products are defined statically in the frontend so they always show
// without requiring backend auth or admin seeding
export const STATIC_PRODUCTS: Product[] = [
  // Keyrings
  {
    id: BigInt(1),
    name: "Classic Leather Keyring",
    category: "Keyrings",
    description: "Elegant leather keyring with metal clasp",
    price: BigInt(1299 + 13000),
    imageUrl: "/assets/generated/keyrings.dim_400x300.jpg",
    stock: BigInt(25),
  },
  {
    id: BigInt(2),
    name: "Galaxy Keychain",
    category: "Keyrings",
    description: "Colorful galaxy-themed keychain",
    price: BigInt(899 + 13000),
    imageUrl: "/assets/generated/keyrings.dim_400x300.jpg",
    stock: BigInt(40),
  },
  {
    id: BigInt(3),
    name: "Minimalist Metal Loop",
    category: "Keyrings",
    description: "Sleek metal keyring for modern style",
    price: BigInt(1599 + 13000),
    imageUrl: "/assets/generated/keyrings.dim_400x300.jpg",
    stock: BigInt(15),
  },
  // Pencil Boxes
  {
    id: BigInt(4),
    name: "Boho Pencil Box",
    category: "Pencil Boxes",
    description: "Fabric pencil box with boho patterns",
    price: BigInt(2299 + 13000),
    imageUrl: "/assets/generated/pencil-boxes.dim_400x300.jpg",
    stock: BigInt(20),
  },
  {
    id: BigInt(5),
    name: "Transparent Stationery Case",
    category: "Pencil Boxes",
    description: "Clear plastic case with compartments",
    price: BigInt(1799 + 13000),
    imageUrl: "/assets/generated/pencil-boxes.dim_400x300.jpg",
    stock: BigInt(30),
  },
  {
    id: BigInt(6),
    name: "Floral Design Pencil Box",
    category: "Pencil Boxes",
    description: "Metal box with floral patterns",
    price: BigInt(1899 + 13000),
    imageUrl: "/assets/generated/pencil-boxes.dim_400x300.jpg",
    stock: BigInt(18),
  },
  // Kids Folders
  {
    id: BigInt(7),
    name: "Space Adventure Folder",
    category: "Kids Folders",
    description: "Durable folder with space theme",
    price: BigInt(799 + 13000),
    imageUrl: "/assets/generated/kids-folders.dim_400x300.jpg",
    stock: BigInt(50),
  },
  {
    id: BigInt(8),
    name: "Underwater Creatures Folder",
    category: "Kids Folders",
    description: "Folder with colorful sea animals",
    price: BigInt(899 + 13000),
    imageUrl: "/assets/generated/kids-folders.dim_400x300.jpg",
    stock: BigInt(45),
  },
  {
    id: BigInt(9),
    name: "Superhero Organizer",
    category: "Kids Folders",
    description: "Folder with popular superhero prints",
    price: BigInt(999 + 13000),
    imageUrl: "/assets/generated/kids-folders.dim_400x300.jpg",
    stock: BigInt(38),
  },
  // Perfumes
  {
    id: BigInt(10),
    name: "Fresh Citrus Perfume",
    category: "Perfumes",
    description: "Refreshing citrus blend scent",
    price: BigInt(3999 + 13000),
    imageUrl: "/assets/generated/perfumes.dim_400x300.jpg",
    stock: BigInt(12),
  },
  {
    id: BigInt(11),
    name: "Floral Essence Perfume",
    category: "Perfumes",
    description: "Delicate blend of floral scents",
    price: BigInt(4499 + 13000),
    imageUrl: "/assets/generated/perfumes.dim_400x300.jpg",
    stock: BigInt(8),
  },
  {
    id: BigInt(12),
    name: "Spice Fusion Perfume",
    category: "Perfumes",
    description: "Warm, spicy scent for evening wear",
    price: BigInt(4899 + 13000),
    imageUrl: "/assets/generated/perfumes.dim_400x300.jpg",
    stock: BigInt(10),
  },
  // Cases
  {
    id: BigInt(13),
    name: "Slim Phone Case",
    category: "Cases",
    description: "Ultra-thin protective phone case",
    price: BigInt(2199 + 13000),
    imageUrl: "/assets/generated/cases.dim_400x300.jpg",
    stock: BigInt(35),
  },
  {
    id: BigInt(14),
    name: "Vintage Laptop Sleeve",
    category: "Cases",
    description: "Laptop sleeve with vintage patterns",
    price: BigInt(2999 + 13000),
    imageUrl: "/assets/generated/cases.dim_400x300.jpg",
    stock: BigInt(16),
  },
  {
    id: BigInt(15),
    name: "Tablet Protective Case",
    category: "Cases",
    description: "Shockproof case for tablets",
    price: BigInt(2599 + 13000),
    imageUrl: "/assets/generated/cases.dim_400x300.jpg",
    stock: BigInt(22),
  },
  // Bags
  {
    id: BigInt(9999),
    name: "Designer Crescent Handbag",
    category: "Bags",
    description:
      "Stylish crescent-shaped handbag with monogram pattern and gold charms — perfect for everyday glam",
    price: BigInt(60000 + 13000),
    imageUrl: "/assets/uploads/Screenshot_20260309_015648_WhatsApp-1.jpg",
    stock: BigInt(10),
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
