import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LocalOrder } from "./CheckoutDialog";

const ADMIN_PASSWORD = "atozadmin2024";
const ADMIN_SESSION_KEY = "atoz_admin_authed";
const LOCAL_ORDERS_KEY = "atozstore_orders";

function loadLocalOrders(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalOrder[];
  } catch {
    return [];
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "delivered":
      return "bg-green-100 text-green-800 border-green-300";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
}

interface ProofOverlayProps {
  src: string;
  onClose: () => void;
}

function ProofOverlay({ src, onClose }: ProofOverlayProps) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      data-ocid="admin.modal"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation wrapper */}
      <div
        className="relative max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          onClick={onClose}
          data-ocid="admin.close_button"
          aria-label="Close proof view"
        >
          <X className="w-7 h-7" />
        </button>
        <img
          src={src}
          alt="Payment proof full view"
          className="w-full max-h-[80vh] object-contain rounded-xl border-2 border-white/20 shadow-2xl"
        />
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: LocalOrder;
  index: number;
}

function OrderCard({ order, index }: OrderCardProps) {
  const [proofOpen, setProofOpen] = useState(false);

  return (
    <>
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        data-ocid={`admin.item.${index}`}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground font-display tracking-tight">
                {order.id}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <Badge
            className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}
          >
            {order.status}
          </Badge>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Customer
              </p>
              <p className="text-sm font-bold text-foreground">
                {order.customerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.customerPhone}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.customerEmail}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Delivery Address
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                {order.customerAddress}
              </p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Items Ordered
            </p>
            <div className="flex flex-col gap-1.5">
              {order.items.map((item) => {
                const lineTotal = (
                  (item.unitPrice * item.quantity) /
                  100
                ).toFixed(0);
                return (
                  <div
                    key={item.productName}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground flex-1 mr-2">
                      {item.productName}
                      <span className="text-muted-foreground ml-1 text-xs">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold text-foreground shrink-0">
                      ₹{lineTotal}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
              <span className="font-bold text-sm text-foreground">Total</span>
              <span className="font-bold text-base text-primary">
                ₹{(order.totalPrice / 100).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Payment proof */}
          {order.paymentProofUrl && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Payment Proof
                </p>
                <button
                  type="button"
                  onClick={() => setProofOpen(true)}
                  className="relative group overflow-hidden rounded-xl border-2 border-green-300 bg-green-50 hover:border-green-500 transition-all w-full max-w-xs"
                  data-ocid={`admin.item.${index}`}
                  aria-label="View payment proof"
                >
                  <img
                    src={order.paymentProofUrl}
                    alt="Payment proof thumbnail"
                    className="w-full max-h-28 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="px-3 py-1.5 bg-green-100 border-t border-green-300 text-xs text-green-800 font-semibold text-left">
                    Tap to view full proof
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {proofOpen && order.paymentProofUrl && (
        <ProofOverlay
          src={order.paymentProofUrl}
          onClose={() => setProofOpen(false)}
        />
      )}
    </>
  );
}

export function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthed) {
      setOrders(loadLocalOrders());
    }
  }, [isAuthed]);

  const loadOrders = () => {
    setOrders(loadLocalOrders());
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      } catch {
        // ignore
      }
      setIsAuthed(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAuthed(false);
    setPassword("");
    setOrders([]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Small delay for UX feedback
    await new Promise((r) => setTimeout(r, 400));
    loadOrders();
    setIsRefreshing(false);
  };

  const handleBackToStore = () => {
    window.location.hash = "";
    window.location.reload();
  };

  // ── Login Screen ──
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm" data-ocid="admin.panel">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShoppingBag className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              A TO Z Store
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
          </div>

          {/* Login card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">
                Admin Access Required
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={`rounded-xl h-11 pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                  data-ocid="admin.input"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-ocid="admin.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="admin.error_state"
                >
                  {passwordError}
                </p>
              )}

              <Button
                className="w-full rounded-xl h-11 font-bold"
                onClick={handleLogin}
                data-ocid="admin.submit_button"
              >
                Access Admin Panel
              </Button>

              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                onClick={handleBackToStore}
                data-ocid="admin.link"
              >
                ← Back to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Orders Dashboard ──
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">
                A TO Z Store
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admin Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-ocid="admin.button"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleBackToStore}
              data-ocid="admin.link"
            >
              Store
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Customer Orders
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {orders.length === 0
                ? "No orders yet"
                : `${orders.length} order${orders.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          {orders.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold font-display text-primary">
                {orders.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          )}
        </div>

        {/* Orders list or empty state */}
        {orders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="admin.empty_state"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              No orders yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Orders placed by customers will appear here. No orders yet or
              connection issue — orders will appear here once customers start
              placing orders.
            </p>
            <Button
              variant="outline"
              className="rounded-xl mt-6"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-ocid="admin.button"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Check for orders
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-auto">
            <div className="flex flex-col gap-4">
              {orders.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index + 1} />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
