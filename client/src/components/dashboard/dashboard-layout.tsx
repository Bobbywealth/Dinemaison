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
        <Link href="/" className="flex flex-col items-start mb-6">
          <div className="mb-3">
            <h1 className={cn(
              "text-3xl font-serif italic",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Maison
            </h1>
            <div className={cn(
              "text-[10px] tracking-[0.2em] uppercase mt-1",
              isDark ? "text-white/60" : "text-slate-500"
            )}>
              THE ART OF
            </div>
            <div className={cn(
              "text-[10px] tracking-[0.2em] uppercase",
              isDark ? "text-white/60" : "text-slate-500"
            )}>
              INTIMATE DINING
            </div>
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

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <HamburgerDrawer
              navItems={navItems.map(item => ({
                id: item.id,
                title: item.title,
                icon: item.icon,
                href: item.href,
                badge: item.badge,
              }))}
              activeItemId={activeItemId}
              onNavigate={onNavigate}
            />
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
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
          items={[
            { id: "home", label: "Home", icon: navItems[0]?.icon || Menu, href: "/dashboard#overview" },
            { 
              id: "bookings", 
              label: "Bookings", 
              icon: navItems.find(i => i.id === "bookings")?.icon || Menu, 
              href: "/dashboard#bookings" 
            },
            { 
              id: "chefs", 
              label: "Chefs", 
              icon: navItems.find(i => i.id === "chefs")?.icon || Menu, 
              href: "/dashboard#chefs" 
            },
            { 
              id: "analytics", 
              label: "Analytics", 
              icon: navItems.find(i => i.id === "analytics")?.icon || Menu, 
              href: "/dashboard#analytics" 
            },
            { 
              id: "more", 
              label: "More", 
              icon: Menu, 
              href: "/dashboard#more" 
            },
          ]}
        />
      )}
    </SidebarProvider>
  );
}
