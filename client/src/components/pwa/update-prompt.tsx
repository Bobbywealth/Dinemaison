import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
      
      toast({
        title: "Updating App",
        description: "Dine Maison is updating to the latest version...",
        action: (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ),
        duration: 2000, // Show briefly before auto-reload
      });
    };

    const handleOfflineReady = () => {
      toast({
        title: "Ready for Offline Use",
        description: "Dine Maison is now available offline!",
      });
    };

    window.addEventListener("pwa-update-available", handleUpdateAvailable);
    window.addEventListener("pwa-offline-ready", handleOfflineReady);

    return () => {
      window.removeEventListener("pwa-update-available", handleUpdateAvailable);
      window.removeEventListener("pwa-offline-ready", handleOfflineReady);
    };
  }, [toast]);

  const handleUpdate = () => {
    // Call the update function exposed in main.tsx
    const updatePWA = (window as any).updatePWA;
    if (updatePWA) {
      updatePWA(true); // Force update immediately
    }
  };

  // This component doesn't render anything itself - it uses toast notifications
  return null;
}

