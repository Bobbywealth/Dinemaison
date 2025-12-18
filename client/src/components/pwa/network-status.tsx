import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function NetworkStatus() {
  const { online, networkInfo } = useNetworkStatus();
  const [showOffline, setShowOffline] = useState(!online);
  const [showReconnected, setShowReconnected] = useState(false);

  const containerClass =
    "fixed z-50 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md " +
    "top-[calc(env(safe-area-inset-top)+1.25rem)] animate-in slide-in-from-top-4 pointer-events-none";

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
      <div className={containerClass}>
        <Alert
          variant="destructive"
          className="pointer-events-auto bg-destructive/95 backdrop-blur-sm border-destructive shadow-lg"
        >
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
      <div className={containerClass}>
        <Alert className="pointer-events-auto bg-green-500/95 backdrop-blur-sm border-green-600 text-white shadow-lg">
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

