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
  const hash = typeof window !== "undefined" ? window.location.hash : "";

  return (
    <Sidebar className="bg-[hsl(220,30%,12%)] text-white border-r border-white/10">
      <SidebarHeader className="border-b border-white/10">
        <Link href="/" className="flex flex-col items-center py-4">
          <img
            src={logoImage}
            alt="Dine Maison"
            className="h-24 w-auto object-contain brightness-0 invert"
          />
          <div className="flex flex-col items-center -mt-8">
            <span className="text-[8px] tracking-[0.3em] uppercase text-white/70">
              The Art of
            </span>
            <span className="text-[8px] tracking-[0.3em] uppercase text-white/70">
              Intimate Dining
            </span>
          </div>
        </Link>
        {user && (
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
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
              <p className="text-xs text-white/70 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Navigation</SidebarGroupLabel>
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
                      className="text-white/80 hover:text-white flex items-center w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-white/10 px-2 text-xs">
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
                      className="text-white/80 hover:text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-white/10 px-2 text-xs">
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

      <SidebarFooter>
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
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
      <SidebarInset className="md:ml-[var(--sidebar-width)]">
        <DashboardTopBar title={title} description={description} />
        <div className={cn("container py-8 space-y-8", className)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
