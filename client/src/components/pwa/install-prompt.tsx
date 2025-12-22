import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show custom install prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Wait 3 seconds before showing
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4">
      <Card className="border-gold/20 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <Download className="h-5 w-5 text-gold" />
              </div>
              <div>
                <CardTitle className="text-base">Install Dine Maison</CardTitle>
                <CardDescription className="text-xs">
                  Quick access to book your next culinary experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-2"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Access your bookings offline</li>
            <li>• Get instant booking notifications</li>
            <li>• Fast, native-like performance</li>
          </ul>
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss} size="sm">
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



