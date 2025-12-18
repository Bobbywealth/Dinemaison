import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/dinemaison-logo.png";
import { cn } from "@/lib/utils";

type SplashScreenProps = {
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
};

export function SplashScreen({ duration = 2000, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center justify-center">
            {/* Logo with fade-in and scale animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              {/* Shimmer effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  maskImage: "url(" + logoImage + ")",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />

              <img
                src={logoImage}
                alt="Dine Maison"
                className="h-32 w-auto object-contain dark:brightness-0 dark:invert"
              />

              <motion.div
                className="flex flex-col items-center -mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  The Art of
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  Intimate Dining
                </span>
              </motion.div>
            </motion.div>

            {/* Bouncing dots */}
            <motion.div
              className="flex items-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage splash screen state
export function useSplashScreen(options?: { duration?: number; skipOnRevisit?: boolean }) {
  const [showSplash, setShowSplash] = useState(() => {
    if (options?.skipOnRevisit) {
      const hasVisited = sessionStorage.getItem("splash-shown");
      return !hasVisited;
    }
    return true;
  });

  const handleComplete = () => {
    if (options?.skipOnRevisit) {
      sessionStorage.setItem("splash-shown", "true");
    }
    setShowSplash(false);
  };

  return { showSplash, handleComplete };
}
