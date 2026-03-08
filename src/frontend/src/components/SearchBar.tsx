import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  isSearching: boolean;
}

export function SearchBar({
  value,
  onChange,
  resultCount,
  isSearching,
}: SearchBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative group">
        {/* Search icon */}
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        />

        {/* Input */}
        <Input
          type="search"
          placeholder="Search products by name or description…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-ocid="search.search_input"
          className="
            pl-11 pr-12 h-12 rounded-2xl
            bg-card border-border
            text-foreground placeholder:text-muted-foreground
            focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary
            transition-all shadow-sm text-sm font-medium
          "
          aria-label="Search products"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            data-ocid="search.clear_button"
            aria-label="Clear search"
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              w-7 h-7 rounded-full flex items-center justify-center
              text-muted-foreground hover:text-foreground
              hover:bg-muted transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
            "
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Result count hint when actively searching */}
      {isSearching && (
        <p className="mt-2 text-xs text-muted-foreground pl-1">
          {resultCount === 0
            ? "No products found"
            : `${resultCount} product${resultCount !== 1 ? "s" : ""} found`}
        </p>
      )}
    </div>
  );
}
