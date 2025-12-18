import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function NetworkStatus() {
  const { online, networkInfo } = useNetworkStatus();
  const [showOffline, setShowOffline] = useState(!online);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!online) {
      setShowOffline(true);
      setShowReconnected(false);
    } else {
      // Show reconnected message briefly
      if (showOffline) {
        setShowReconnected(true);
        setShowOffline(false);
        
        // Hide reconnected message after 3 seconds
        const timer = setTimeout(() => {
          setShowReconnected(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [online, showOffline]);

  if (!showOffline && !showReconnected) {
    return null;
  }

  if (showOffline) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in slide-in-from-top-4">
        <Alert variant="destructive" className="bg-destructive/95 backdrop-blur-sm border-destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>You're offline</strong>
            <br />
            <span className="text-xs">Some features may not be available until you reconnect.</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in slide-in-from-top-4">
        <Alert className="bg-green-500/95 backdrop-blur-sm border-green-600 text-white">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <strong>Back online</strong>
            <br />
            <span className="text-xs opacity-90">Your connection has been restored.</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}

