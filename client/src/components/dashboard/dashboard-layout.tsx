import { PropsWithChildren } from "react";
import { Link } from "wouter";
import { LucideIcon, Menu, LogOut, LogIn } from "lucide-react";
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
      <SidebarHeader className={cn("border-b", isDark ? "border-white/10" : "border-border")}>
        <Link href="/" className="flex flex-col items-center py-4">
          <img
            src={logoImage}
            alt="Dine Maison"
            className={cn(
              "h-24 w-auto object-contain",
              isDark ? "brightness-0 invert" : "brightness-100"
            )}
          />
          <div className="flex flex-col items-center -mt-8">
            <span
              className={cn(
                "text-[8px] tracking-[0.3em] uppercase",
                isDark ? "text-white/70" : "text-slate-900"
              )}
            >
              The Art of
            </span>
            <span
              className={cn(
                "text-[8px] tracking-[0.3em] uppercase",
                isDark ? "text-white/70" : "text-slate-900"
              )}
            >
              Intimate Dining
            </span>
          </div>
        </Link>
        {user && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2",
              isDark ? "bg-white/10" : "bg-slate-100"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                {user.firstName} {user.lastName}
              </p>
              <p
                className={cn(
                  "text-xs truncate",
                  isDark ? "text-white/70" : "text-slate-500"
                )}
              >
                {user.email}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={navLabelClass}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                      className={cn("flex items-center w-full", navLinkClass)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={cn("ml-auto rounded-full px-2 text-xs", badgeClass)}>
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
                      className={navLinkClass}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={cn("ml-auto rounded-full px-2 text-xs", badgeClass)}>
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

      <SidebarSeparator />

      <SidebarFooter className="space-y-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start border text-sm",
            isDark
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-slate-200 text-slate-700 hover:bg-slate-100"
          )}
          asChild
        >
          <Link href="/login">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Link>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm",
            isDark
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-slate-700 hover:bg-slate-100"
          )}
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardTopBar({ title, description }: Pick<DashboardLayoutProps, "title" | "description">) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <p className="text-sm text-muted-foreground">{description}</p>
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
  return (
    <SidebarProvider className="min-h-screen bg-background">
      <DashboardSidebar
        navItems={navItems}
        activeItemId={activeItemId}
        onNavigate={onNavigate}
      />
      <SidebarInset className="flex-1">
        <DashboardTopBar title={title} description={description} />
        <div className={cn("px-4 md:px-6 lg:px-8 py-6 space-y-8", className)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
