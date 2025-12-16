import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChefHat, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/12_1765912912124.png";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = location === "/";

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLandingPage ? "bg-[hsl(220,30%,12%)]/95 backdrop-blur-md border-b border-white/10" : "bg-background border-b border-border"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          <Link href="/" data-testid="link-home">
            <div className="flex flex-col items-start cursor-pointer">
              <img 
                src={logoImage} 
                alt="Dine Maison" 
                className={`h-20 w-auto object-contain ${isLandingPage ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert'}`}
                data-testid="img-logo"
              />
              <div className="flex flex-col mt-1">
                <span className={`text-[9px] tracking-[0.25em] uppercase leading-tight ${isLandingPage ? 'text-white/70' : 'text-muted-foreground'}`}>
                  The Art of
                </span>
                <span className={`text-[9px] tracking-[0.25em] uppercase leading-tight ${isLandingPage ? 'text-white/70' : 'text-muted-foreground'}`}>
                  Intimate Dining
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/chefs" data-testid="link-browse-chefs">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isLandingPage ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                Browse Chefs
              </span>
            </Link>
            <Link href="/become-chef" data-testid="link-become-chef">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isLandingPage ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                Become a Chef
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" data-testid="link-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="link-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="link-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className={`hidden sm:inline-flex ${isLandingPage ? 'text-white hover:bg-white/10' : ''}`} data-testid="button-login">
                  <a href="/api/login">Sign In</a>
                </Button>
                <Button asChild data-testid="button-book-now">
                  <Link href="/chefs">Book Now</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            <Link href="/chefs" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Browse Chefs
              </span>
            </Link>
            <Link href="/become-chef" onClick={() => setMobileMenuOpen(false)}>
              <span className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Become a Chef
              </span>
            </Link>
            {!isAuthenticated && (
              <a href="/api/login" className="block py-2 text-sm font-medium text-primary">
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
