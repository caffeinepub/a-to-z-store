import { Package } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm shadow-header border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            data-ocid="header.link"
            className="flex items-center gap-2.5 group"
            aria-label="A TO Z Store home"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-800 text-lg text-foreground tracking-tight">
                A TO Z
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground -mt-0.5">
                Store
              </span>
            </div>
          </a>

          {/* Store tagline */}
          <p className="hidden md:block text-sm text-muted-foreground font-medium">
            Everything from A to Z, all in one place
          </p>

          {/* Instagram link */}
          <a
            href="https://www.instagram.com/a2z.megastore"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="header.instagram_link"
            className="flex items-center gap-1.5 text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="hidden sm:inline">@a2z.megastore</span>
          </a>
        </div>
      </div>
    </header>
  );
}
