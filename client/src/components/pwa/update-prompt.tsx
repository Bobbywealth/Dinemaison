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
        title: "Update Available",
        description: "A new version of Dine Maison is ready to install.",
        action: (
          <Button
            size="sm"
            onClick={handleUpdate}
            variant="default"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Update
          </Button>
        ),
        duration: 0, // Don't auto-dismiss
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
