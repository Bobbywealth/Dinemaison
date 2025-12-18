import { PropsWithChildren } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import logoImage from "@assets/dinemaison-logo.png";
import { Badge } from "@/components/ui/badge";

export type DrawerNavItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  badge?: number | string;
  onClick?: () => void;
};

type HamburgerDrawerProps = {
  navItems: DrawerNavItem[];
  activeItemId?: string;
  onNavigate?: (itemId: string) => void;
  trigger?: React.ReactNode;
};

export function HamburgerDrawer({
  navItems,
  activeItemId,
  onNavigate,
  trigger,
}: HamburgerDrawerProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <SheetHeader className="border-b border-border p-6">
            <div className="flex flex-col items-center">
              <img
                src={logoImage}
                alt="Dine Maison"
                className="h-24 w-auto object-contain dark:brightness-0 dark:invert"
              />
              <div className="flex flex-col items-center -mt-6">
                <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  The Art of
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  Intimate Dining
                </span>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted mt-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItemId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (onNavigate) {
                        onNavigate(item.id);
                      } else if (item.href) {
                        window.location.hash = item.id;
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                      "text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className="h-5 min-w-[20px] px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer - Logout */}
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

