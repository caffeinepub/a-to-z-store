import { Heart, Package } from "lucide-react";

const CATEGORIES = [
  "Keyrings",
  "Pencil Boxes",
  "Kids Folders",
  "Perfumes",
  "Cases",
];

interface FooterProps {
  onCategorySelect: (category: string) => void;
}

export function Footer({ onCategorySelect }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-800 text-lg text-secondary-foreground tracking-tight">
                  A TO Z Store
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-secondary-foreground/60 -mt-0.5">
                  Official Store
                </span>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed max-w-xs">
              Your one-stop shop for everything from A to Z — quality products
              delivered right to your door.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-700 text-base mb-4 text-secondary-foreground">
              Shop by Category
            </h3>
            <ul className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    className="text-secondary-foreground/70 hover:text-primary text-sm transition-colors text-left"
                    onClick={() => onCategorySelect(cat)}
                    data-ocid="footer.link"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display font-700 text-base mb-4 text-secondary-foreground">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <li>Free shipping on orders over $50</li>
              <li>30-day easy returns</li>
              <li>Secure checkout</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-secondary-foreground/60 text-xs">
            © {currentYear} A TO Z Store. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-secondary-foreground/60 text-xs flex items-center gap-1">
              Built with{" "}
              <Heart
                className="w-3 h-3 text-primary fill-primary inline"
                aria-hidden="true"
              />{" "}
              using{" "}
              <a
                href={caffeineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <a
              href="/#/admin"
              className="text-secondary-foreground/25 hover:text-secondary-foreground/50 text-[10px] transition-colors"
              data-ocid="footer.link"
              aria-label="Admin panel"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
