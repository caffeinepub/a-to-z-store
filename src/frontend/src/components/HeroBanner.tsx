import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroBannerProps {
  onShopNow: () => void;
}

export function HeroBanner({ onShopNow }: HeroBannerProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(200px, 40vw, 420px)" }}
    >
      {/* Background image */}
      <img
        src="/assets/generated/hero-banner.dim_1200x400.jpg"
        alt="A TO Z Store — variety of products"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Gradient overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-bold uppercase tracking-widest text-store-yellow mb-2"
            >
              Welcome to A TO Z Store
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-800 text-white leading-tight mb-4"
            >
              Everything from
              <br />
              <span style={{ color: "oklch(0.88 0.15 90)" }}>A to Z</span> —
              Shop Now
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all group"
                onClick={onShopNow}
              >
                Browse Products
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
