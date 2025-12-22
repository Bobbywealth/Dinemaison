import { motion } from "framer-motion";
import { Loader2, ChefHat, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple Spinner
export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  );
}

// Luxury Chef Hat Spinner
export function ChefSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn("flex items-center justify-center", className)}
    >
      <ChefHat className="h-12 w-12 text-primary" />
    </motion.div>
  );
}

// Pulsing Dots Loader
export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Gradient Progress Bar
export function GradientProgress({ 
  progress, 
  className,
  showLabel = true 
}: { 
  progress: number; 
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-amber-500 to-primary bg-[length:200%_auto] animate-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-muted-foreground text-center">
          {progress}% complete
        </p>
      )}
    </div>
  );
}

// Skeleton Loading Card
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6 border border-border/50 rounded-lg", className)}>
      <motion.div
        className="h-48 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: "200% 100%" }}
      />
      <div className="space-y-2">
        <motion.div
          className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-3/4"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: 0.1
          }}
          style={{ backgroundSize: "200% 100%" }}
        />
        <motion.div
          className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded w-1/2"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: 0.2
          }}
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>
    </div>
  );
}

// Full Page Loading Screen
export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-primary" />
          </div>
          
          {/* Sparkles around the icon */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: i === 0 || i === 2 ? (i === 0 ? "10%" : "70%") : "40%",
                left: i === 1 || i === 3 ? (i === 1 ? "10%" : "70%") : "40%",
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
          <PulsingDots />
        </div>
      </div>
    </motion.div>
  );
}

// Mini Inline Loader
export function InlineLoader({ text = "Loading" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Shimmer Effect
export function Shimmer({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("absolute inset-0 -translate-x-full", className)}
      animate={{
        translateX: ["100%", "-100%"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
      }}
    />
  );
}

// Success Checkmark Animation
export function SuccessCheck({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.svg
          className="w-8 h-8 text-white"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}



