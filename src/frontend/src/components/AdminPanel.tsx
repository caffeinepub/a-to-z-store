import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  IndianRupee,
  Lock,
  LogOut,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Store,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";
import type { LocalOrder } from "./CheckoutDialog";

// ── Constants ────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "atozadmin2024";
const ADMIN_SESSION_KEY = "atoz_admin_authed";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminOrder extends LocalOrder {
  backendId?: bigint;
}

type FilterTab = "All" | "Pending" | "Confirmed" | "Cancelled";

// ── Data fetching ─────────────────────────────────────────────────────────────

const LOCAL_ORDERS_KEY = "atozstore_orders";

function readLocalOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchAllOrders(actor: backendInterface): Promise<AdminOrder[]> {
  // PRIMARY: Always fetch from backend — this is the real source of truth
  // Backend stores orders from ALL customers, not just this device
  const backendOrders = await actor.getCustomerOrdersPublic();

  const backendMapped: AdminOrder[] = backendOrders.map((order) => ({
    id: `ATZ-${order.id.toString()}`,
    backendId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
    })),
    totalPrice: Number(order.totalPrice),
    paymentProofUrl: order.paymentProofUrl || "",
    status: order.status,
    createdAt: Number(order.createdAt) / 1_000_000, // ns → ms
    backendSaved: true,
  }));

  // Read local orders for proof image enrichment and fallback
  const localOrders = readLocalOrders();

  // Build a lookup map: customerPhone+customerName -> local order (for proof images)
  const localByKey = new Map<string, AdminOrder>(
    localOrders.map((o) => [`${o.customerPhone}${o.customerName}`, o]),
  );

  // Enrich backend orders with proof images from localStorage
  // (Backend stores paymentProofUrl as "" to avoid ICP message size limits)
  const enrichedBackend = backendMapped.map((order) => {
    if (!order.paymentProofUrl) {
      const localMatch = localByKey.get(
        `${order.customerPhone}${order.customerName}`,
      );
      if (localMatch?.paymentProofUrl) {
        return { ...order, paymentProofUrl: localMatch.paymentProofUrl };
      }
    }
    return order;
  });

  // SECONDARY: Include local-only orders where backend save failed
  // Only show local orders that are NOT already represented in backend (backendSaved !== true)
  const localOnlyFailed = localOrders.filter((o) => o.backendSaved !== true);

  // Dedup: don't show local orders that are already in the backend (same customer)
  const backendCustomerKeys = new Set(
    enrichedBackend.map((o) => `${o.customerPhone}${o.customerName}`),
  );
  const trulyLocalOnly = localOnlyFailed.filter(
    (o) => !backendCustomerKeys.has(`${o.customerPhone}${o.customerName}`),
  );

  // Merge: backend orders first (source of truth), then any failed-backend local orders
  const merged = [...enrichedBackend, ...trulyLocalOnly];

  // Return sorted by createdAt descending (newest first)
  return merged.sort((a, b) => b.createdAt - a.createdAt);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function getStatusStyle(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "delivered":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    case "cancelled":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      };
  }
}

// ── ProofOverlay ──────────────────────────────────────────────────────────────

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
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper */}
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

// ── OrderCard ─────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: AdminOrder;
  index: number;
  actor: backendInterface;
  onOrderCancelled: () => void;
  onOrderStatusChanged: () => void;
}

function OrderCard({
  order,
  index,
  actor,
  onOrderCancelled,
  onOrderStatusChanged,
}: OrderCardProps) {
  const [proofOpen, setProofOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statusStyle = getStatusStyle(order.status);
  const statusLower = order.status.toLowerCase();
  const canCancel = statusLower !== "cancelled" && statusLower !== "delivered";
  const canConfirm = statusLower === "pending";
  const canDeliver = statusLower === "confirmed";

  const handleCancel = async () => {
    if (!order.backendId) {
      toast.error("Cannot cancel: order ID not found.");
      return;
    }
    const confirmed = window.confirm(
      `Cancel order ${order.id}?\n\nCustomer: ${order.customerName}\nThis cannot be undone.`,
    );
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await actor.updateOrderStatus(order.backendId, "Cancelled");
      toast.success("Order cancelled");
      onOrderCancelled();
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order.backendId) {
      toast.error("Cannot update: order ID not found.");
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await actor.updateOrderStatus(order.backendId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      onOrderStatusChanged();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Your A TO Z Store Order ${order.id}`);
    const body = encodeURIComponent(
      `Hi ${order.customerName},\n\nRegarding your order ${order.id} from A TO Z Store.\n\nPlease reply to this email if you have any questions.\n\nThank you!\nA TO Z Store Team`,
    );
    window.open(
      `mailto:${order.customerEmail}?subject=${subject}&body=${body}`,
    );
  };

  const handleCall = () => {
    window.open(`tel:${order.customerPhone}`);
  };

  return (
    <>
      <article
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
        data-ocid={`admin.item.${index}`}
      >
        {/* ── Card Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-muted/20 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
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

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} shrink-0`}
            />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* ── Customer Info + Address ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                Customer
              </p>
              <p className="text-sm font-bold text-foreground">
                {order.customerName}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" />
                {order.customerPhone}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{order.customerEmail}</span>
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                Delivery Address
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                {order.customerAddress}
              </p>
            </div>
          </div>

          <Separator />

          {/* ── Items ── */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
              Items Ordered
            </p>
            <div className="flex flex-col gap-1.5 bg-muted/20 rounded-xl p-3 border border-border/60">
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
                    <span className="text-foreground flex-1 mr-2 truncate">
                      {item.productName}
                      <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold text-foreground shrink-0 text-xs">
                      ₹{lineTotal}
                    </span>
                  </div>
                );
              })}
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">Total</span>
                <span className="font-bold text-base text-primary price-tag">
                  ₹{(order.totalPrice / 100).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Payment Proof ── */}
          {order.paymentProofUrl && (
            <>
              <Separator />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                  Payment Proof
                </p>
                <button
                  type="button"
                  onClick={() => setProofOpen(true)}
                  className="relative group overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 transition-all w-full max-w-[260px]"
                  aria-label="View payment proof"
                >
                  <img
                    src={order.paymentProofUrl}
                    alt="Payment proof thumbnail"
                    className="w-full max-h-28 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-100 border-t border-emerald-200 text-xs text-emerald-800 font-semibold text-left flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Tap to view full proof
                  </div>
                </button>
              </div>
            </>
          )}

          {!order.paymentProofUrl && (
            <>
              <Separator />
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Payment proof not available on this device. The customer
                uploaded it from their device.
              </div>
            </>
          )}

          <Separator />

          {/* ── Actions: Status + Contact ── */}
          <div className="flex flex-col gap-3">
            {/* Status action buttons */}
            <div className="flex flex-wrap gap-2">
              {canConfirm && (
                <Button
                  size="sm"
                  className="rounded-xl gap-2 flex-1 min-w-[130px] bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus("Confirmed")}
                  disabled={isUpdatingStatus}
                  data-ocid={`admin.confirm_button.${index}`}
                >
                  {isUpdatingStatus ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Confirmed
                    </>
                  )}
                </Button>
              )}
              {canDeliver && (
                <Button
                  size="sm"
                  className="rounded-xl gap-2 flex-1 min-w-[130px] bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleUpdateStatus("Delivered")}
                  disabled={isUpdatingStatus}
                  data-ocid={`admin.secondary_button.${index}`}
                >
                  {isUpdatingStatus ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5" />
                      Mark Delivered
                    </>
                  )}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl gap-2 flex-1 min-w-[130px]"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  data-ocid={`admin.delete_button.${index}`}
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Order
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Contact Customer */}
            <div className="bg-muted/30 border border-border/60 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Contact Customer
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 flex-1 min-w-[130px] border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                  onClick={handleEmail}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 flex-1 min-w-[130px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                  onClick={handleCall}
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  Call Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {proofOpen && order.paymentProofUrl && (
        <ProofOverlay
          src={order.paymentProofUrl}
          onClose={() => setProofOpen(false)}
        />
      )}
    </>
  );
}

// ── Stats Card ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}

function StatsCard({ label, value, icon, accent }: StatsCardProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 shadow-xs ${accent}`}
    >
      <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold font-display text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────

export function AdminPanel() {
  const { actor, isFetching: actorLoading } = useActor();

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

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  // ── Load orders ──
  const loadOrders = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetched = await fetchAllOrders(actor);
      setOrders(fetched);
      setBackendConnected(true);
    } catch (err) {
      console.error("Failed to load orders from backend:", err);
      // Fallback: show locally stored orders if backend is unreachable
      const localFallback = readLocalOrders();
      if (localFallback.length > 0) {
        setOrders(localFallback);
        setBackendConnected(false);
        setFetchError(
          "Could not reach server — showing orders saved on this device only. Tap Refresh to try again.",
        );
      } else {
        setOrders([]);
        setFetchError(
          "Could not load orders from server. Please tap Refresh to try again.",
        );
        setBackendConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  // ── Load orders once actor is ready ──
  useEffect(() => {
    if (!isAuthed || !actor) return;
    loadOrders();
  }, [isAuthed, actor, loadOrders]);

  // ── Auto-refresh every 30s ──
  useEffect(() => {
    if (!isAuthed || !actor) return;
    const interval = setInterval(loadOrders, 30_000);
    return () => clearInterval(interval);
  }, [isAuthed, actor, loadOrders]);

  // ── Stats ──
  const totalOrders = orders.length;
  const todayOrders = orders.filter((o) => isToday(o.createdAt)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0) / 100;

  // ── Filter ──
  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter(
          (o) => o.status.toLowerCase() === activeFilter.toLowerCase(),
        );

  const filterTabs: FilterTab[] = ["All", "Pending", "Confirmed", "Cancelled"];

  // ── Login handlers ──
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
    setFetchError(null);
    setBackendConnected(false);
  };

  const handleBackToStore = () => {
    window.location.hash = "";
    window.location.reload();
  };

  // ════════════════════════════════════════════════════════════════
  // ── LOGIN SCREEN ───────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm" data-ocid="admin.panel">
          {/* Logo */}
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
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
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
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="admin.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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

  // ════════════════════════════════════════════════════════════════
  // ── ORDERS DASHBOARD ───────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border shadow-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-none">
                A TO Z Store
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={loadOrders}
              disabled={isLoading || actorLoading}
              data-ocid="admin.button"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading || actorLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleBackToStore}
              data-ocid="admin.link"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* ── Stats Bar ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatsCard
            label="Total Orders"
            value={totalOrders}
            icon={<ShoppingBag className="w-5 h-5 text-primary" />}
            accent=""
          />
          <StatsCard
            label="Today's Orders"
            value={todayOrders}
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            accent=""
          />
          <StatsCard
            label="Total Revenue"
            value={`₹${totalRevenue.toFixed(0)}`}
            icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
            accent=""
          />
        </section>

        {/* ── Status Banners ── */}
        {fetchError && (
          <div
            className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800"
            data-ocid="admin.error_state"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p>{fetchError}</p>
          </div>
        )}

        {!fetchError && backendConnected && (
          <div
            className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800"
            data-ocid="admin.success_state"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <p>
              {totalOrders === 0
                ? "No orders yet — orders placed by customers will appear here."
                : `Loaded ${totalOrders} order${totalOrders !== 1 ? "s" : ""} from server.`}
            </p>
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const count =
              tab === "All"
                ? orders.length
                : orders.filter(
                    (o) => o.status.toLowerCase() === tab.toLowerCase(),
                  ).length;
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
                data-ocid="admin.tab"
              >
                {tab}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Orders List ── */}
        {(isLoading || actorLoading) && filteredOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="admin.loading_state"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              {actorLoading
                ? "Connecting to server…"
                : "Fetching orders from server…"}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="admin.empty_state"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              {activeFilter === "All"
                ? "No orders yet"
                : `No ${activeFilter.toLowerCase()} orders`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {activeFilter === "All"
                ? "Orders placed by customers will appear here once someone completes a purchase."
                : `There are no ${activeFilter.toLowerCase()} orders at the moment.`}
            </p>
            {activeFilter !== "All" && (
              <button
                type="button"
                onClick={() => setActiveFilter("All")}
                className="mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View all orders
              </button>
            )}
            <Button
              variant="outline"
              className="rounded-xl mt-4"
              onClick={loadOrders}
              disabled={isLoading || actorLoading}
              data-ocid="admin.button"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading || actorLoading ? "animate-spin" : ""}`}
              />
              Check for orders
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-auto">
            <div className="flex flex-col gap-4 pb-8">
              {filteredOrders.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={idx + 1}
                  actor={actor!}
                  onOrderCancelled={loadOrders}
                  onOrderStatusChanged={loadOrders}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
