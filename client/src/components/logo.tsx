import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "small" | "large";
  showTagline?: boolean;
  textColor?: string;
}

export function Logo({ 
  className = "", 
  variant = "default",
  showTagline = false,
  textColor = "text-white"
}: LogoProps) {
  const sizes = {
    small: {
      text: "text-xl",
      diamond: "text-2xl",
      tagline: "text-[8px]",
      spacing: "gap-1",
    },
    default: {
      text: "text-2xl",
      diamond: "text-3xl",
      tagline: "text-[9px]",
      spacing: "gap-2",
    },
    large: {
      text: "text-4xl",
      diamond: "text-5xl",
      tagline: "text-xs",
      spacing: "gap-3",
    },
  };

  const size = sizes[variant];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("flex items-center", size.spacing, "group")}>
        <span className={cn(
          "font-serif font-medium tracking-wider transition-all duration-300 group-hover:scale-105",
          size.text,
          textColor
        )}>
          DINE
        </span>
        <span className={cn(
          size.diamond,
          "transition-all duration-300 group-hover:rotate-12 group-hover:scale-110",
          textColor
        )}>
          ◆
        </span>
        <span className={cn(
          "font-serif font-medium tracking-wider transition-all duration-300 group-hover:scale-105",
          size.text,
          textColor
        )}>
          MAISON
        </span>
      </div>
      {showTagline && (
        <div className="flex flex-col items-center -mt-1">
          <span className={cn(
            size.tagline,
            "tracking-[0.25em] uppercase leading-tight transition-colors",
            textColor,
            "opacity-70"
          )}>
            The Art of
          </span>
          <span className={cn(
            size.tagline,
            "tracking-[0.25em] uppercase leading-tight transition-colors",
            textColor,
            "opacity-70"
          )}>
            Intimate Dining
          </span>
        </div>
      )}
    </div>
  );
}