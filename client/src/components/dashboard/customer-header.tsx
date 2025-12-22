import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/dinemaison-logo.png";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { LogOut, User, Home, ChefHat, Calendar, Heart, MessageSquare, Settings } from "lucide-react";

export function CustomerDesktopHeader() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setLocation("/");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-24 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start gap-1">
          <img 
            src={logoImage} 
            alt="Maison" 
            className={cn(
              "h-16 w-auto object-contain",
              isDark ? "brightness-0 invert" : ""
            )}
          />
          <div className="flex flex-col items-center self-center -mt-1">
            <div className={cn(
              "text-[10px] tracking-[0.3em] uppercase",
              isDark ? "text-white/50" : "text-slate-500"
            )}>
              THE ART OF
            </div>
            <div className={cn(
              "text-[10px] tracking-[0.3em] uppercase -mt-0.5",
              isDark ? "text-white/50" : "text-slate-500"
            )}>
              INTIMATE DINING
            </div>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/chefs">
              <ChefHat className="mr-2 h-4 w-4" />
              Browse Chefs
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard#upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard#favorites">
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Link>
          </Button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationCenter />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full">
                  <Avatar className="h-11 w-11 border-2 border-border">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard#upcoming">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard#favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard#reviews">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>My Reviews</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard#more">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}


