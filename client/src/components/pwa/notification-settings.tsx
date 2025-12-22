import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed,
  showTestNotification,
} from "@/lib/push-notifications";

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsLoading(true);

    try {
      if (enabled) {
        // Request permission and subscribe
        const permissionResult = await requestNotificationPermission();
        
        if (permissionResult === "granted") {
          const subscription = await subscribeToPushNotifications();
          
          if (subscription) {
            setIsSubscribed(true);
            setPermission("granted");
            
            toast({
              title: "Notifications Enabled",
              description: "You'll receive updates about your bookings.",
            });

            // Show test notification
            await showTestNotification();
          } else {
            toast({
              title: "Subscription Failed",
              description: "Could not subscribe to notifications. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
        }
      } else {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications();
        
        if (success) {
          setIsSubscribed(false);
          toast({
            title: "Notifications Disabled",
            description: "You won't receive push notifications anymore.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Available
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about booking confirmations, messages, and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="flex flex-col gap-1">
            <span>Enable Notifications</span>
            <span className="text-xs text-muted-foreground font-normal">
              {permission === "granted" 
                ? "Notifications are allowed" 
                : permission === "denied"
                ? "Notifications are blocked in browser settings"
                : "Click to request permission"}
            </span>
          </Label>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        {isSubscribed && (
          <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
            <p className="font-medium">You'll be notified about:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Booking confirmations</li>
              <li>• Chef acceptance or rejection</li>
              <li>• Messages from your chef</li>
              <li>• Booking reminders (24 hours before)</li>
              <li>• Payment confirmations</li>
            </ul>
          </div>
        )}

        {permission === "denied" && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium mb-1">Notifications Blocked</p>
            <p className="text-xs">
              To enable notifications, please allow them in your browser settings and refresh this page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



