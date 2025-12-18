import { Link, useLocation } from "wouter";
import { LucideIcon, Home, Calendar, ChefHat, BarChart3, Menu as MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type BottomNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
};

type BottomNavigationProps = {
  items?: BottomNavItem[];
  className?: string;
};

const defaultItems: BottomNavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard#overview" },
  { id: "bookings", label: "Bookings", icon: Calendar, href: "/dashboard#bookings" },
  { id: "chefs", label: "Chefs", icon: ChefHat, href: "/dashboard#chefs" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard#analytics" },
  { id: "more", label: "More", icon: MoreHorizontal, href: "/dashboard#more" },
];

export function BottomNavigation({ items = defaultItems, className }: BottomNavigationProps) {
  const [location] = useLocation();
  const hash = typeof window !== "undefined" ? window.location.hash : "";

  const isActive = (item: BottomNavItem) => {
    const itemHash = item.href.includes("#") ? item.href.split("#")[1] : "";
    const currentHash = hash.replace("#", "");
    
    // Special case for home/overview
    if (item.id === "home" && (!currentHash || currentHash === "overview")) {
      return true;
    }
    
    return itemHash === currentHash;
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "border-t border-border shadow-lg",
        "pb-safe", // Safe area for iOS
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative",
                "transition-colors duration-200",
                "touch-manipulation", // Better mobile touch response
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={(e) => {
                // Smooth scroll to section
                if (item.href.includes("#")) {
                  e.preventDefault();
                  const sectionId = item.href.split("#")[1];
                  window.location.hash = sectionId;
                  
                  // Trigger smooth scroll
                  setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else if (sectionId === "overview" || sectionId === "home") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }, 50);
                }
              }}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}

              <div className="relative">
                <Icon className={cn("h-6 w-6", active && "scale-110")} />
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>

              <span
                className={cn(
                  "text-[11px] font-medium",
                  active && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
