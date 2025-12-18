import { cn } from "@/lib/utils";

type LogoVariant = "default" | "compact" | "large";

interface LogoProps {
  variant?: LogoVariant;
  showTagline?: boolean;
  textColor?: string;
  className?: string;
}

const variantClasses: Record<LogoVariant, string> = {
  compact: "text-lg leading-none",
  default: "text-xl md:text-2xl leading-tight",
  large: "text-3xl md:text-4xl leading-tight",
};

/**
 * Brand logo component used across dashboards and auth flows.
 * Supports optional tagline and sizing presets to keep usage consistent.
 */
export function Logo({
  variant = "default",
  showTagline = false,
  textColor,
  className,
}: LogoProps) {
  const baseColor =
    textColor ??
    "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "font-serif font-semibold uppercase tracking-[0.28em]",
          variantClasses[variant],
          baseColor
        )}
      >
        <span className="block">DINE</span>
        <span className="block">MAISON</span>
      </div>

      {showTagline && (
        <div
          className={cn(
            "flex flex-col items-center text-[10px] tracking-[0.32em] uppercase",
            textColor ? `${textColor} opacity-70` : "text-muted-foreground"
          )}
        >
          <span>The Art of</span>
          <span>Intimate Dining</span>
        </div>
      )}
    </div>
  );
}

