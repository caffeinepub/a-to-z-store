import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CustomerOrder {
    id: bigint;
    customerName: string;
    status: string;
    customerPhone: string;
    createdAt: bigint;
    customerAddress: string;
    items: Array<OrderItem>;
    totalPrice: bigint;
    customerEmail: string;
    paymentProofUrl: string;
}
export interface OrderItem {
    productName: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface NewCustomerOrder {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: Array<OrderItem>;
    totalPrice: bigint;
    customerEmail: string;
    paymentProofUrl: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: string;
    userId: Principal;
    createdAt: bigint;
    items: Array<CartItem>;
    totalPrice: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCustomerOrdersPublic(): Promise<Array<CustomerOrder>>;
    getOrders(): Promise<Array<Order>>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCustomerOrder(newOrder: NewCustomerOrder): Promise<void>;
    seedProducts(): Promise<void>;
    updateCartQuantity(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
}
