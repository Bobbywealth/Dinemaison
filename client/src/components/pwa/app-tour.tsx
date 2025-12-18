import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Dine Maison",
    description: "Experience the art of intimate dining with world-class private chefs at your fingertips.",
    icon: "🍽️",
  },
  {
    title: "Browse Expert Chefs",
    description: "Discover talented chefs with diverse cuisines and specialties. View their profiles, menus, and reviews.",
    icon: "👨‍🍳",
    action: "Browse Chefs",
  },
  {
    title: "Book Your Experience",
    description: "Select your preferred date, time, and number of guests. Customize your menu and dietary preferences.",
    icon: "📅",
  },
  {
    title: "Enjoy at Home",
    description: "Sit back and relax while your chef prepares an unforgettable dining experience in the comfort of your own space.",
    icon: "🏡",
  },
  {
    title: "Are You a Chef?",
    description: "Join our platform to showcase your culinary talents and connect with clients seeking exceptional private dining.",
    icon: "⭐",
    action: "Become a Chef",
  },
];

export function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Wait for isMobile to be determined (starts as undefined)
    if (isMobile === undefined) {
      return;
    }

    // Only show tour on mobile devices and on the home page
    const hasSeenTour = localStorage.getItem("dinemaison-tour-completed");
    const hasVisitedBefore = localStorage.getItem("dinemaison-has-visited");
    const isHomePage = location === "/" || location === "/login";

    // Show tour only if: mobile + home page + haven't seen it + first visit
    if (isMobile && isHomePage && !hasSeenTour && !hasVisitedBefore) {
      // Mark as visited now that we're showing the tour
      localStorage.setItem("dinemaison-has-visited", "true");
      
      // Show tour after a short delay to let splash screen finish
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Increased delay to 3s to let splash finish
      return () => clearTimeout(timer);
    }
  }, [location, isMobile]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("dinemaison-tour-completed", "true");
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem("dinemaison-tour-completed", "true");
    setIsOpen(false);

    // Handle action if the current step has one
    const currentStepData = tourSteps[currentStep];
    if (currentStepData.action === "Browse Chefs") {
      setLocation("/chefs");
    } else if (currentStepData.action === "Become a Chef") {
      setLocation("/become-chef");
    }
  };

  const handleAction = () => {
    const currentStepData = tourSteps[currentStep];
    localStorage.setItem("dinemaison-tour-completed", "true");
    setIsOpen(false);

    if (currentStepData.action === "Browse Chefs") {
      setLocation("/chefs");
    } else if (currentStepData.action === "Become a Chef") {
      setLocation("/become-chef");
    }
  };

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9998] backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[9999] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Close tour"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-8 md:p-10">
              {/* Icon */}
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-7xl mb-6 text-center"
              >
                {currentStepData.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-bold text-center mb-4"
              >
                {currentStepData.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-center mb-8 leading-relaxed"
              >
                {currentStepData.description}
              </motion.p>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-8 bg-primary"
                        : index < currentStep
                        ? "w-2 bg-primary/50"
                        : "w-2 bg-muted"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}

                {currentStepData.action ? (
                  <Button
                    onClick={handleAction}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {currentStepData.action}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLastStep ? (
                      <>
                        Get Started
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Tour
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manually trigger the tour
export function useAppTour() {
  const [showTour, setShowTour] = useState(false);

  const startTour = () => {
    setShowTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem("dinemaison-tour-completed");
    localStorage.removeItem("dinemaison-has-visited");
  };

  return { showTour, startTour, resetTour };
}

