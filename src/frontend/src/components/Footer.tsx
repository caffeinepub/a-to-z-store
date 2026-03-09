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
              delivered right to your door in Delhi.
            </p>
            <a
              href="https://www.instagram.com/a2z.megastore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors font-semibold text-sm mt-1"
              data-ocid="footer.instagram_link"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @a2z.megastore
            </a>
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

          {/* Contact */}
          <div>
            <h3 className="font-display font-700 text-base mb-4 text-secondary-foreground">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <li>📍 Delhi, India</li>
              <li>🚚 Delivery within Delhi</li>
              <li>
                <a
                  href="https://www.instagram.com/a2z.megastore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  📸 DM us on Instagram to order
                </a>
              </li>
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
        </div>
      </div>
    </footer>
  );
}
