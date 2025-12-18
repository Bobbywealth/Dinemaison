import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home, Calendar, ChefHat, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface OfflineFallbackProps {
  pageName?: string;
  description?: string;
}

export function OfflineFallback({ 
  pageName = "this page", 
  description = "You're offline. Some features may be unavailable until you reconnect."
}: OfflineFallbackProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (isOnline) {
    handleRetry();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-orange-50 dark:bg-orange-950 p-4 rounded-full">
              <WifiOff className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            You're Offline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            disabled={retrying}
            className="w-full"
            size="lg"
          >
            {retrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              While offline, you can still access:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Link href="/">
                <Button variant="outline" className="w-full" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              
              <Link href="/chefs">
                <Button variant="outline" className="w-full" size="sm">
                  <ChefHat className="mr-2 h-4 w-4" />
                  Chefs
                </Button>
              </Link>
              
              <Link href="/bookings">
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Bookings
                </Button>
              </Link>
              
              <Link href="/messages">
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Cached data may be shown while offline</p>
          <p className="mt-1">Check your internet connection and try again</p>
        </div>
      </Card>
    </div>
  );
}

export function HomeOfflineFallback() {
  return (
    <OfflineFallback 
      pageName="Home"
      description="Can't load the latest content. You can still browse cached chefs and bookings."
    />
  );
}

export function ChefsOfflineFallback() {
  return (
    <OfflineFallback 
      pageName="Chefs"
      description="Can't load chef listings. You can view previously loaded chefs from cache."
    />
  );
}

export function BookingsOfflineFallback() {
  return (
    <OfflineFallback 
      pageName="Bookings"
      description="Can't load your bookings. Reconnect to view the latest updates."
    />
  );
}

export function MenuOfflineFallback() {
  return (
    <OfflineFallback 
      pageName="Menu"
      description="Can't load menu items. You can view previously loaded menus from cache."
    />
  );
}
