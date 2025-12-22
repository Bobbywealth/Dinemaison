import { PropsWithChildren } from "react";
import { Link } from "wouter";
import { LucideIcon, Menu, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import logoImage from "@assets/dinemaison-logo.png";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-provider";
import { queryClient } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNavigation } from "@/components/mobile/bottom-navigation";
import { HamburgerDrawer } from "@/components/mobile/hamburger-drawer";
import { NotificationCenter } from "@/components/notifications/notification-center";

export type DashboardNavItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  badge?: number | string;
};

type DashboardLayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
  navItems: DashboardNavItem[];
  className?: string;
  activeItemId?: string;
  onNavigate?: (itemId: string) => void;
}>;

function DashboardSidebar({
  navItems,
  activeItemId,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  activeItemId?: string;
  onNavigate?: (itemId: string) => void;
}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const isDark = theme === "dark";
  const sidebarClasses = cn(
    "border-r transition-colors",
    isDark ? "bg-[hsl(220,30%,12%)] text-white border-white/10" : "bg-white text-slate-900 border-border"
  );
  const navLabelClass = isDark ? "text-white/60" : "text-slate-500";
  const navLinkClass = isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900";
  const badgeClass = isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700";

  return (
    <Sidebar className={sidebarClasses}>
      <SidebarHeader className={cn("border-b", isDark ? "border-white/10" : "border-border", "px-6 py-6")}>
        <Link href="/" className="flex flex-col items-center mb-6">
          <img 
            src={logoImage} 
            alt="Dine Maison" 
            className={cn(
              "h-16 w-auto object-contain mb-2",
              isDark ? "brightness-0 invert" : ""
            )}
          />
          <div className={cn(
            "text-[9px] tracking-[0.25em] uppercase text-center",
            isDark ? "text-white/60" : "text-slate-500"
          )}>
            THE ART OF
          </div>
          <div className={cn(
            "text-[9px] tracking-[0.25em] uppercase text-center",
            isDark ? "text-white/60" : "text-slate-500"
          )}>
            INTIMATE DINING
          </div>
        </Link>
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5",
              isDark ? "bg-white/5" : "bg-slate-50"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className={cn(
                "text-xs font-semibold",
                isDark ? "bg-primary/20 text-primary-foreground" : "bg-primary/10 text-primary"
              )}>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className={cn(
                "text-sm font-semibold leading-tight truncate",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {user.firstName} {user.lastName}
              </p>
              <p
                className={cn(
                  "text-xs truncate",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                {user.email}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-2 px-3",
            isDark ? "text-white/50" : "text-slate-500"
          )}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                {onNavigate ? (
                  <SidebarMenuButton
                    asChild
                    isActive={activeItemId === item.id}
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(item.id);
                    }}
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeItemId === item.id
                          ? isDark 
                            ? "bg-white/10 text-white" 
                            : "bg-slate-100 text-slate-900"
                          : isDark
                          ? "text-white/70 hover:bg-white/5 hover:text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          isDark ? "bg-primary/20 text-primary-foreground" : "bg-primary/10 text-primary"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={hash === `#${item.id}`}
                  >
                    <a
                      href={item.href || `#${item.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        hash === `#${item.id}`
                          ? isDark 
                            ? "bg-white/10 text-white" 
                            : "bg-slate-100 text-slate-900"
                          : isDark
                          ? "text-white/70 hover:bg-white/5 hover:text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          isDark ? "bg-primary/20 text-primary-foreground" : "bg-primary/10 text-primary"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className={cn(isDark ? "bg-white/10" : "bg-border")} />

      <SidebarFooter className="px-3 py-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-lg",
            isDark
              ? "text-white/70 hover:text-white hover:bg-white/5"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            queryClient.setQueryData(["/api/auth/user"], null);
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardTopBar({ 
  title, 
  description,
  navItems,
  activeItemId,
  onNavigate,
}: Pick<DashboardLayoutProps, "title" | "description" | "navItems" | "activeItemId" | "onNavigate">) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mobile header with centered logo and notification icons
  if (isMobile) {
    const drawerItems = navItems.map((item) => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      href: item.href,
      badge: item.badge,
    }));

    return (
      <div className="sticky-top-safe z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe">
        {/* Top row with menu + icons */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <HamburgerDrawer
            navItems={drawerItems}
            activeItemId={activeItemId}
            onNavigate={onNavigate}
          />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>
        
        {/* Logo section */}
        <div className="flex flex-col items-center pb-4 px-4">
          <Link href="/" className="flex flex-col items-center gap-1">
            <img 
              src={logoImage} 
              alt="Maison" 
              className={cn(
                "h-12 w-auto object-contain",
                isDark ? "brightness-0 invert" : ""
              )}
            />
            <div className="flex flex-col items-center -mt-1">
              <div className={cn(
                "text-[7px] tracking-[0.25em] uppercase",
                isDark ? "text-white/50" : "text-slate-500"
              )}>
                THE ART OF
              </div>
              <div className={cn(
                "text-[7px] tracking-[0.25em] uppercase -mt-0.5",
                isDark ? "text-white/50" : "text-slate-500"
              )}>
                INTIMATE DINING
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop header
  return (
    <div className="sticky-top-safe z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationCenter />
          {user && (
            <Avatar className="h-9 w-9 border-2 border-border">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({
  title,
  description,
  navItems,
  children,
  className,
  activeItemId,
  onNavigate,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  // Mobile bottom nav should be small (max ~5 items) to avoid label collisions.
  // Use a priority list to choose the most important sections across roles.
  const bottomNavItems = (() => {
    const priorityIds = [
      "overview",
      "requests",
      "upcoming",
      "bookings",
      "chefs",
      "earnings",
      "favorites",
      "reviews",
      "users",
      "verifications",
      "payouts",
      "revenue",
      "settings",
    ];

    const byId = new Map(navItems.map((item) => [item.id, item]));
    const selected: DashboardNavItem[] = [];
    const seen = new Set<string>();

    const push = (item?: DashboardNavItem) => {
      if (!item) return;
      if (seen.has(item.id)) return;
      seen.add(item.id);
      selected.push(item);
    };

    // Always try to include overview first.
    push(byId.get("overview") || navItems[0]);

    for (const id of priorityIds) {
      if (selected.length >= 4) break;
      push(byId.get(id));
    }

    // Fill to 4 items if we still don't have enough.
    for (const item of navItems) {
      if (selected.length >= 4) break;
      push(item);
    }

    // Always include "more" if present; otherwise include the last item if we had to truncate.
    const more = byId.get("more");
    if (more) {
      push(more);
    } else if (navItems.length > selected.length) {
      // Ensure a fifth tab exists so users can always reach the full drawer.
      push(navItems[navItems.length - 1]);
    }

    // If nav is already small, just use everything.
    const finalItems = navItems.length <= 5 ? navItems : selected.slice(0, 5);

    return finalItems.map((item) => ({
      id: item.id,
      label: item.title,
      icon: item.icon,
      href: item.href || `#${item.id}`,
      badge: typeof item.badge === "number" ? item.badge : undefined,
    }));
  })();

  return (
    <SidebarProvider className="min-h-screen bg-background">
      {/* Hide sidebar on mobile */}
      {!isMobile && (
        <DashboardSidebar
          navItems={navItems}
          activeItemId={activeItemId}
          onNavigate={onNavigate}
        />
      )}
      <SidebarInset className="flex-1">
        <DashboardTopBar 
          title={title} 
          description={description}
          navItems={navItems}
          activeItemId={activeItemId}
          onNavigate={onNavigate}
        />
        <div className={cn(
          "px-4 md:px-6 lg:px-8 py-6 space-y-8",
          isMobile && "pb-24", // Add padding for bottom navigation
          className
        )}>
          {children}
        </div>
      </SidebarInset>

      {/* Show bottom navigation on mobile */}
      {isMobile && (
        <BottomNavigation
          items={bottomNavItems.length ? bottomNavItems : undefined}
          onNavigate={onNavigate}
        />
      )}
    </SidebarProvider>
  );
}



