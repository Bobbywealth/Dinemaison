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
import { ChefHat, User, LogOut, LayoutDashboard, Menu, X, Home, Info, Utensils, Users, HelpCircle, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import logoImage from "@assets/dinemaison-logo.png";
import { useTheme } from "@/lib/theme-provider";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const isLandingPage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const scrollToSection = (sectionId: string) => {
    if (location !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Our Chefs", href: "/chefs", icon: Users },
    { label: "Services", action: () => scrollToSection("services"), icon: Utensils },
    { label: "How It Works", action: () => scrollToSection("how-it-works"), icon: HelpCircle },
    { label: "About", action: () => scrollToSection("testimonials"), icon: Info },
    { label: "Become a Chef", href: "/become-chef", icon: ChefHat },
    { label: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 shadow-lg backdrop-blur-md border-b border-slate-200 dark:border-slate-700' 
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex flex-col items-center cursor-pointer group">
              <img 
                src={logoImage} 
                alt="Dine Maison" 
                className={`h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                  scrolled ? 'dark:brightness-0 dark:invert' : 'brightness-0 invert'
                }`}
                data-testid="img-logo"
              />
              <div className="flex flex-col items-center -mt-4">
                <span className={`text-[8px] tracking-[0.25em] uppercase leading-tight transition-colors ${
                  scrolled ? 'text-slate-900 dark:text-slate-400' : 'text-white/70'
                }`}>
                  The Art of
                </span>
                <span className={`text-[8px] tracking-[0.25em] uppercase leading-tight transition-colors ${
                  scrolled ? 'text-slate-900 dark:text-slate-400' : 'text-white/70'
                }`}>
                  Intimate Dining
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.href ? (
                <Link key={link.label} href={link.href} data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <span className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                    scrolled 
                      ? 'text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-primary' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  } ${location === link.href ? (scrolled ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white') : ''}`}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </span>
                </Link>
              ) : (
                <button 
                  key={link.label} 
                  onClick={link.action}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                    scrolled 
                      ? 'text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-primary' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              )
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all" data-testid="button-user-menu">
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
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                        window.location.href = "/";
                      }}
                      className="w-full cursor-pointer"
                      data-testid="link-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  asChild 
                  className={`hidden sm:inline-flex transition-all ${
                    scrolled 
                      ? 'text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300' 
                      : 'text-white hover:bg-white/15'
                  }`} 
                  data-testid="button-login"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" data-testid="button-signup">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden transition-colors ${scrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`px-4 py-4 space-y-1 ${
          scrolled 
            ? 'bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700' 
            : 'bg-black/80 backdrop-blur-md border-t border-white/10'
        }`}>
          {navLinks.map((link) => (
            link.href ? (
              <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                  scrolled 
                    ? 'text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                } ${location === link.href ? (scrolled ? 'bg-primary/10 text-primary' : 'bg-white/15 text-white') : ''}`}>
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </span>
              </Link>
            ) : (
              <button 
                key={link.label} 
                onClick={() => { link.action?.(); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg transition-colors w-full text-left ${
                  scrolled 
                    ? 'text-slate-600 hover:text-primary hover:bg-primary/10 dark:text-slate-300' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </button>
            )
          ))}
          {!isAuthenticated && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <span className={`flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg ${
                  scrolled ? 'text-primary' : 'text-primary'
                }`}>
                  <User className="h-5 w-5" />
                  Sign In
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
