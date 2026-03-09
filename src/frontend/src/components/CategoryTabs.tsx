import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FlaskConical,
  FolderOpen,
  Key,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
} from "lucide-react";

const CATEGORIES = [
  { id: "All", label: "All Products", icon: Tag },
  { id: "Keyrings", label: "Keyrings", icon: Key },
  { id: "Pencil Boxes", label: "Pencil Boxes", icon: BookOpen },
  { id: "Kids Folders", label: "Kids Folders", icon: FolderOpen },
  { id: "Perfumes", label: "Perfumes", icon: Sparkles },
  {
    id: "Perfume Mini Travel Cases",
    label: "Perfume Mini Travel Cases",
    icon: FlaskConical,
  },
  { id: "Cases", label: "Cases", icon: Smartphone },
  { id: "Bags", label: "Bags", icon: ShoppingBag },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeCategory} onValueChange={onCategoryChange}>
          <TabsList className="h-auto bg-transparent gap-1 py-3 px-0 overflow-x-auto flex-nowrap w-full justify-start rounded-none">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                data-ocid="products.tab"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap
                  data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=active]:shadow-sm hover:bg-muted transition-all"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{id}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
