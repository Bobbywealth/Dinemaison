import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/dinemaison-logo.png";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

export function CustomerDesktopHeader() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start gap-0.5">
          <img 
            src={logoImage} 
            alt="Maison" 
            className={cn(
              "h-12 w-auto object-contain",
              isDark ? "brightness-0 invert" : ""
            )}
          />
          <div className="flex flex-col items-center self-center -mt-1">
            <div className={cn(
              "text-[7px] tracking-[0.3em] uppercase",
              isDark ? "text-white/50" : "text-slate-500"
            )}>
              THE ART OF
            </div>
            <div className={cn(
              "text-[7px] tracking-[0.3em] uppercase -mt-0.5",
              isDark ? "text-white/50" : "text-slate-500"
            )}>
              INTIMATE DINING
            </div>
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationCenter />
          {user && (
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
}
