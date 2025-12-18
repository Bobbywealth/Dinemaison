import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function OfflinePage() {
  const [, setLocation] = useLocation();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 rounded-full bg-muted p-4 w-fit">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription className="text-base mt-2">
            It looks like you've lost your internet connection. Some features may not be available right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
            <p className="font-medium">What you can still do:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• View previously loaded chef profiles</li>
              <li>• Review your cached bookings</li>
              <li>• Browse saved menu items</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your connection will be restored automatically when you're back online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
