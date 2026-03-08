import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { CartItem, Product } from "../hooks/useQueries";

const STORE_EMAIL = "farhaadahmad20@gmail.com";

// EmailJS public configuration — uses EmailJS free tier
const EMAILJS_SERVICE_ID = "service_atoz";
const EMAILJS_TEMPLATE_ID = "template_atoz_order";
const EMAILJS_PUBLIC_KEY = "user_atoz_store_key";

const LOCAL_ORDERS_KEY = "atozstore_orders";

export interface LocalOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  totalPrice: number;
  paymentProofUrl: string;
  status: string;
  createdAt: number;
}

function saveOrderToLocalStorage(order: LocalOrder) {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders: LocalOrder[] = raw ? (JSON.parse(raw) as LocalOrder[]) : [];
    orders.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  products: Product[];
  totalPrice: number;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

type Step = 1 | 2 | 3;

function getAddressRegion(address: string): "delhi" | "india" | "outside" {
  const lower = address.toLowerCase();
  const foreignKeywords = [
    "usa",
    "united states",
    "uk",
    "england",
    "australia",
    "canada",
    "pakistan",
    "china",
    "nepal",
    "bangladesh",
    "singapore",
    "dubai",
    "uae",
    "germany",
    "france",
    "italy",
    "spain",
    "japan",
    "korea",
    "new york",
    "london",
    "sydney",
    "toronto",
    "tokyo",
    "paris",
  ];
  const indiaKeywords = [
    "delhi",
    "mumbai",
    "bangalore",
    "bengaluru",
    "chennai",
    "kolkata",
    "hyderabad",
    "pune",
    "ahmedabad",
    "surat",
    "jaipur",
    "lucknow",
    "kanpur",
    "nagpur",
    "indore",
    "thane",
    "bhopal",
    "visakhapatnam",
    "pimpri",
    "patna",
    "vadodara",
    "ghaziabad",
    "ludhiana",
    "coimbatore",
    "agra",
    "madurai",
    "nashik",
    "faridabad",
    "meerut",
    "rajkot",
    "varanasi",
    "amritsar",
    "allahabad",
    "ranchi",
    "gurgaon",
    "gurugram",
    "india",
    "up",
    "mp",
    "rajasthan",
    "maharashtra",
    "gujarat",
    "karnataka",
    "kerala",
    "tamilnadu",
    "tamil",
    "andhra",
    "telangana",
    "odisha",
    "bihar",
    "jharkhand",
    "uttarakhand",
    "himachal",
    "jammu",
    "kashmir",
    "punjab",
    "haryana",
    "assam",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "tripura",
    "sikkim",
    "goa",
    "chhattisgarh",
    "110",
    "400",
    "600",
    "700",
    "500",
    "560",
  ];

  for (const kw of foreignKeywords) {
    if (lower.includes(kw)) return "outside";
  }

  if (
    lower.includes("delhi") ||
    lower.includes("new delhi") ||
    lower.startsWith("11")
  ) {
    return "delhi";
  }

  for (const kw of indiaKeywords) {
    if (lower.includes(kw)) return "india";
  }

  if (address.trim().length >= 10) return "india";

  return "outside";
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ATZ-${ts}-${rand}`;
}

// Convert a File to base64 data URL
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Send order notification email via EmailJS REST API
async function sendOrderEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  itemsSummary: string;
  grandTotal: string;
  proofBase64: string;
  proofFileName: string;
}): Promise<void> {
  const payload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email: STORE_EMAIL,
      order_id: params.orderId,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      customer_address: params.customerAddress,
      items_summary: params.itemsSummary,
      grand_total: params.grandTotal,
      payment_proof: params.proofBase64,
      proof_filename: params.proofFileName,
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EmailJS error: ${text}`);
  }
}

export function CheckoutDialog({
  open,
  onOpenChange,
  cartItems,
  products,
  totalPrice,
  onSuccess,
}: CheckoutDialogProps) {
  const { actor } = useActor();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderId, setOrderId] = useState<string>("");
  const [addressRegion, setAddressRegion] = useState<
    "delhi" | "india" | "outside"
  >("india");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productMap = new Map<string, Product>(
    products.map((p) => [p.id.toString(), p]),
  );

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+\d\s\-().]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required";
    } else {
      const region = getAddressRegion(formData.address);
      setAddressRegion(region);
      if (region !== "delhi") {
        newErrors.address = "Sorry, we only deliver within Delhi at this time";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (!validateStep1()) return;
    const region = getAddressRegion(formData.address);
    setAddressRegion(region);
    setStep(2);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setProofFile(file);
    const url = URL.createObjectURL(file);
    setProofPreview(url);
    toast.success("Payment screenshot uploaded!");
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    if (proofPreview) {
      URL.revokeObjectURL(proofPreview);
      setProofPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmOrder = async () => {
    if (!proofFile) {
      toast.error("Please upload your payment screenshot before confirming.");
      return;
    }
    if (!paymentConfirmed) {
      toast.error("Please confirm you have completed the payment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrderId = generateOrderId();

      // Build items list
      const orderItems = cartItems
        .map((item) => {
          const product = productMap.get(item.productId.toString());
          if (!product) return null;
          return {
            productName: product.name,
            quantity: Number(item.quantity),
            unitPrice: Number(product.price),
          };
        })
        .filter(Boolean) as Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
      }>;

      // Build items summary text for email
      const itemsSummary = orderItems
        .map((item) => {
          const lineTotal = ((item.unitPrice * item.quantity) / 100).toFixed(0);
          return `${item.productName} x${item.quantity} = ₹${lineTotal}`;
        })
        .join("\n");

      // Convert proof to base64
      const proofBase64 = await fileToBase64(proofFile);

      // Save order to localStorage immediately (primary data store for admin panel)
      const localOrder: LocalOrder = {
        id: newOrderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        items: orderItems,
        totalPrice: totalPrice,
        paymentProofUrl: proofBase64,
        status: "pending",
        createdAt: Date.now(),
      };
      saveOrderToLocalStorage(localOrder);

      // Try to save order to backend (best effort)
      if (actor) {
        try {
          await actor.saveCustomerOrder({
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            customerAddress: formData.address,
            items: orderItems.map((item) => ({
              productName: item.productName,
              quantity: BigInt(item.quantity),
              unitPrice: BigInt(item.unitPrice),
            })),
            totalPrice: BigInt(totalPrice),
            paymentProofUrl: proofBase64,
          });
        } catch (backendErr) {
          // Backend save failed silently — order is saved in localStorage
          console.warn("Backend order save failed:", backendErr);
        }
      }

      // Try to send email notification (best effort)
      try {
        await sendOrderEmail({
          orderId: newOrderId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          itemsSummary,
          grandTotal: (totalPrice / 100).toFixed(0),
          proofBase64,
          proofFileName: proofFile.name,
        });
      } catch (emailErr) {
        // Email notification failed silently — order still completes
        console.warn("Email notification could not be sent:", emailErr);
      }

      setOrderId(newOrderId);
      setStep(3);
      toast.success("Order confirmed! Thank you for your purchase.");
    } catch (error) {
      console.error("Order failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 3) {
      onSuccess();
    }
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setOrderId("");
      setFormData({ name: "", email: "", phone: "", address: "" });
      setErrors({});
      setPaymentConfirmed(false);
      setProofFile(null);
      if (proofPreview) {
        URL.revokeObjectURL(proofPreview);
        setProofPreview(null);
      }
    }, 300);
  };

  const isLoading = isSubmitting;

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Confirmed" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg w-full flex flex-col gap-0 p-0 overflow-hidden"
        style={{ maxHeight: "90dvh", height: "90dvh" }}
        data-ocid="checkout.dialog"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0 bg-gradient-to-r from-primary/5 to-primary/10">
          <DialogTitle className="font-display font-bold text-xl text-foreground">
            {step === 1 && "Checkout"}
            {step === 2 && "Complete Payment"}
            {step === 3 && "Order Confirmed!"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === 1 && "Enter your delivery details to proceed."}
            {step === 2 && "Scan the QR or use UPI ID to pay."}
            {step === 3 && "Your order has been placed successfully."}
          </DialogDescription>

          {step !== 3 && (
            <div className="flex items-center gap-2 mt-3">
              {steps.slice(0, 3).map((s, i) => (
                <div key={s.num} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all shrink-0 ${
                      step === s.num
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : step > s.num
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      step === s.num
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < 2 && (
                    <div
                      className={`h-px flex-1 mx-1 ${
                        step > s.num ? "bg-green-400" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* ── STEP 1: Customer Details ── */}
        {step === 1 && (
          <>
            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex flex-col gap-5 pb-2">
                {/* Order summary mini */}
                <div className="bg-muted/40 rounded-xl p-3 border border-border/60">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Order Summary
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {cartItems.map((item) => {
                      const product = productMap.get(item.productId.toString());
                      if (!product) return null;
                      const lineTotal = (
                        (Number(product.price) * Number(item.quantity)) /
                        100
                      ).toFixed(0);
                      return (
                        <div
                          key={item.productId.toString()}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground truncate flex-1 mr-2">
                            {product.name}
                            <span className="text-muted-foreground ml-1">
                              ×{Number(item.quantity)}
                            </span>
                          </span>
                          <span className="font-semibold text-foreground shrink-0">
                            ₹{lineTotal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-2" />
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      Total
                    </span>
                    <span className="font-bold text-lg text-primary">
                      ₹{(totalPrice / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="checkout-name"
                    className="font-semibold text-sm flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-name"
                    type="text"
                    placeholder="e.g. Farhaad Ahmad"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`rounded-xl h-11 ${errors.name ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    autoComplete="name"
                    data-ocid="checkout.input"
                  />
                  {errors.name && (
                    <p
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="checkout.error_state"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="checkout-email"
                    className="font-semibold text-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    placeholder="e.g. you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`rounded-xl h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    autoComplete="email"
                    data-ocid="checkout.input"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="checkout-phone"
                    className="font-semibold text-sm flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={`rounded-xl h-11 ${errors.phone ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    autoComplete="tel"
                    data-ocid="checkout.input"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="checkout-address"
                    className="font-semibold text-sm flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Delivery Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="checkout-address"
                    placeholder="House/Flat No., Street, City, State, PIN Code"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }));
                      if (errors.address) {
                        setErrors((prev) => ({ ...prev, address: undefined }));
                      }
                    }}
                    className={`rounded-xl resize-none ${errors.address ? "border-destructive focus-visible:ring-destructive/50" : ""}`}
                    rows={3}
                    autoComplete="street-address"
                    data-ocid="checkout.textarea"
                  />
                  {errors.address && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="checkout.error_state"
                    >
                      {errors.address}
                    </p>
                  )}
                  {!errors.address &&
                    addressRegion === "delhi" &&
                    formData.address.trim().length > 5 && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                        Delhi delivery confirmed — free delivery!
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-background">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-semibold"
                onClick={handleClose}
                data-ocid="checkout.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl font-bold h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={handleContinueToPayment}
                data-ocid="checkout.submit_button"
              >
                Continue to Payment →
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 2: UPI Payment ── */}
        {step === 2 && (
          <>
            <div
              className="flex-1 overflow-y-auto px-6 py-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex flex-col gap-4 pb-2">
                {/* Grand total display */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount to Pay
                  </p>
                  <p className="text-4xl font-bold text-primary font-display">
                    ₹{(totalPrice / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Free delivery included
                  </p>
                </div>

                {/* QR Code section */}
                <div
                  className="flex flex-col items-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5"
                  data-ocid="checkout.panel"
                >
                  <div className="flex items-center gap-2 text-amber-800">
                    <Smartphone className="w-4 h-4" />
                    <p className="font-bold text-sm">Scan & Pay</p>
                  </div>

                  <img
                    src="/assets/dc676735-fcf8-41c7-8c48-dc8906b79c8c.jpg"
                    alt="UPI QR Code – farhaadahmad@fam"
                    className="w-52 h-auto rounded-xl object-contain shadow-md border border-amber-200"
                  />

                  <div className="text-center w-full">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      UPI ID
                    </p>
                    <div className="flex items-center justify-center gap-2 bg-white border border-amber-300 rounded-lg px-4 py-2.5">
                      <span className="font-bold text-sm text-foreground tracking-wide">
                        farhaadahmad@fam
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("farhaadahmad@fam");
                          toast.success("UPI ID copied to clipboard!");
                        }}
                        className="p-1 rounded hover:bg-amber-100 transition-colors flex-shrink-0"
                        aria-label="Copy UPI ID"
                        data-ocid="checkout.button"
                      >
                        <Copy className="w-4 h-4 text-amber-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-800">
                      How to Pay
                    </p>
                  </div>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Open PhonePe, Google Pay, Paytm or any UPI app</li>
                    <li>Scan the QR code above or enter the UPI ID</li>
                    <li>
                      Enter the amount:{" "}
                      <strong>₹{(totalPrice / 100).toFixed(0)}</strong>
                    </li>
                    <li>Complete the payment</li>
                    <li>Take a screenshot of the payment success screen</li>
                    <li>Upload it below as proof</li>
                  </ol>
                </div>

                {/* Payment proof upload */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    Upload Payment Screenshot{" "}
                    <span className="text-destructive">*</span>
                  </p>

                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-green-50">
                      <img
                        src={proofPreview}
                        alt="Payment proof"
                        className="w-full max-h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
                        aria-label="Remove screenshot"
                        data-ocid="checkout.delete_button"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                      <div className="px-3 py-2 bg-green-100 border-t border-green-300">
                        <p className="text-xs text-green-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Screenshot uploaded: {proofFile?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 px-4 py-6 transition-colors cursor-pointer w-full"
                      data-ocid="checkout.upload_button"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">
                          Tap to upload payment screenshot
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          JPG, PNG — max 5MB
                        </p>
                      </div>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProofUpload}
                    data-ocid="checkout.dropzone"
                  />
                </div>

                {/* Payment confirmation checkbox */}
                <label
                  htmlFor="payment-done"
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border-2 transition-colors cursor-pointer ${
                    paymentConfirmed
                      ? "bg-green-50 border-green-400"
                      : "bg-muted/40 border-border"
                  }`}
                  data-ocid="checkout.checkbox"
                >
                  <Checkbox
                    id="payment-done"
                    checked={paymentConfirmed}
                    onCheckedChange={(checked) =>
                      setPaymentConfirmed(checked === true)
                    }
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-sm font-semibold cursor-pointer select-none leading-snug">
                    Yes, I have completed the payment of{" "}
                    <span className="text-green-700">
                      ₹{(totalPrice / 100).toFixed(0)}
                    </span>{" "}
                    via UPI
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      Tick this box after scanning and paying
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0 bg-background">
              <Button
                variant="outline"
                className="rounded-xl font-semibold px-4"
                onClick={() => setStep(1)}
                disabled={isLoading}
                data-ocid="checkout.cancel_button"
              >
                ← Back
              </Button>
              <Button
                className={`flex-1 rounded-xl font-bold h-11 shadow-sm text-white transition-colors ${
                  paymentConfirmed && proofFile
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-muted-foreground/50 cursor-not-allowed"
                }`}
                onClick={handleConfirmOrder}
                disabled={isLoading || !paymentConfirmed || !proofFile}
                data-ocid="checkout.confirm_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Confirming your order...
                  </>
                ) : (
                  "Confirm My Order"
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── STEP 3: Order Confirmed ── */}
        {step === 3 && (
          <div className="flex-1 overflow-y-auto">
            <div
              className="flex flex-col items-center gap-5 px-6 py-8 text-center"
              data-ocid="checkout.success_state"
            >
              {/* Success icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
                  <span className="text-xs text-primary-foreground font-bold">
                    ✓
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Order Confirmed!
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Thank you, <strong>{formData.name}</strong>! Your order is
                  being prepared.
                </p>
              </div>

              {/* Order ID */}
              <div className="w-full bg-muted/60 rounded-xl px-5 py-3 flex items-center gap-3 border border-border/60">
                <Package className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-bold text-foreground font-display tracking-wide">
                    {orderId || "N/A"}
                  </p>
                </div>
              </div>

              {/* Store notification banner */}
              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 text-left">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800">
                    Store Notified
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Order details, your contact info and payment proof have been
                    sent to the store at{" "}
                    <span className="font-semibold">{STORE_EMAIL}</span>
                  </p>
                </div>
              </div>

              {/* Payment proof confirmation */}
              {proofPreview && (
                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                  <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Payment Proof Submitted
                  </p>
                  <img
                    src={proofPreview}
                    alt="Payment proof"
                    className="w-full max-h-32 object-contain rounded-lg border border-green-300"
                  />
                  <p className="text-xs text-green-700 mt-2">
                    Your payment screenshot has been sent to the store. We will
                    verify and process your order shortly.
                  </p>
                </div>
              )}

              {/* Items summary */}
              <div className="w-full bg-muted/40 rounded-xl p-4 border border-border/60 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                  Items Ordered
                </p>
                <div className="flex flex-col gap-2">
                  {cartItems.map((item, idx) => {
                    const product = productMap.get(item.productId.toString());
                    if (!product) return null;
                    const lineTotal = (
                      (Number(product.price) * Number(item.quantity)) /
                      100
                    ).toFixed(0);
                    return (
                      <div
                        key={item.productId.toString()}
                        className="flex items-center justify-between text-sm"
                        data-ocid={`checkout.item.${idx + 1}`}
                      >
                        <span className="text-foreground flex-1 mr-2">
                          {product.name}
                          <span className="text-muted-foreground ml-1 text-xs">
                            × {Number(item.quantity)}
                          </span>
                        </span>
                        <span className="font-semibold text-foreground shrink-0">
                          ₹{lineTotal}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-2.5" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-lg text-primary">
                    ₹{(totalPrice / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Customer details recap */}
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 text-left">
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold mb-0.5">Delivery Address</p>
                    <p>{formData.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <p>{formData.phone}</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                  <p>{formData.email}</p>
                </div>
              </div>

              {/* Continue shopping button */}
              <Button
                className="w-full rounded-xl font-bold h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md mt-2"
                onClick={handleClose}
                data-ocid="checkout.close_button"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
