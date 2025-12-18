import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, MessageSquare, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChannelPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

interface NotificationPreferences {
  [key: string]: ChannelPreferences;
}

const notificationTypes = [
  {
    id: "booking_requested",
    label: "Booking Requested",
    description: "When you request a booking with a chef",
  },
  {
    id: "booking_confirmed",
    label: "Booking Confirmed",
    description: "When a chef confirms your booking",
  },
  {
    id: "booking_cancelled",
    label: "Booking Cancelled",
    description: "When a booking is cancelled",
  },
  {
    id: "booking_reminder",
    label: "Booking Reminder",
    description: "Reminder before your upcoming booking",
  },
  {
    id: "payment_success",
    label: "Payment Successful",
    description: "When your payment is processed successfully",
  },
  {
    id: "payment_failed",
    label: "Payment Failed",
    description: "When a payment fails",
  },
  {
    id: "message_received",
    label: "Messages",
    description: "When you receive a new message",
  },
  {
    id: "review_received",
    label: "Reviews",
    description: "When you receive a review (for chefs)",
  },
];

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreferences>({});

  // Fetch current preferences
  const { data, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notifications/preferences"],
  });

  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to save preferences");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reset preferences mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/preferences/reset", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to reset preferences");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences reset",
        description: "Your notification preferences have been reset to defaults.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
    },
  });

  const handleToggle = (notificationType: string, channel: keyof ChannelPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType]?.[channel],
      },
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all preferences to defaults?")) {
      resetMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Notification Settings - Dine Maison</title>
      </Helmet>

      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications from Dine Maison
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to be notified for each type of event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Header Row */}
            <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 mb-4 pb-4 border-b">
              <div>
                <p className="text-sm font-medium">Event Type</p>
              </div>
              <div className="flex items-center justify-center w-16">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-16">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-16">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-center w-16">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Notification Types */}
            <div className="space-y-6">
              {notificationTypes.map((type) => (
                <div
                  key={type.id}
                  className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 items-center"
                >
                  <div>
                    <Label className="font-medium">{type.label}</Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <Switch
                      checked={preferences[type.id]?.push ?? true}
                      onCheckedChange={() => handleToggle(type.id, "push")}
                    />
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <Switch
                      checked={preferences[type.id]?.email ?? true}
                      onCheckedChange={() => handleToggle(type.id, "email")}
                    />
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <Switch
                      checked={preferences[type.id]?.sms ?? false}
                      onCheckedChange={() => handleToggle(type.id, "sms")}
                    />
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <Switch
                      checked={preferences[type.id]?.inApp ?? true}
                      onCheckedChange={() => handleToggle(type.id, "inApp")}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Push</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>In-App</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={resetMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About SMS Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              SMS notifications are only sent for high-priority events to avoid excessive messaging.
              Standard text messaging rates may apply. You can disable SMS notifications at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
