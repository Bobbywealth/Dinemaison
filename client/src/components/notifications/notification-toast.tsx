import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationWebSocket } from "@/hooks/use-notifications";
import { Bell } from "lucide-react";

/**
 * Component that listens to WebSocket notifications and shows toasts
 * Add this to your app's root layout
 */
export function NotificationToastListener() {
  const { toast } = useToast();
  const { ws } = useNotificationWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "notification:new") {
          const notification = message.payload;

          toast({
            title: notification.data?.title || notification.title || "New Notification",
            description: notification.data?.body || notification.body,
            action: notification.data?.url ? (
              <a
                href={notification.data.url}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                View
              </a>
            ) : undefined,
          });
        }
      } catch (error) {
        console.error("Error handling WebSocket notification:", error);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, toast]);

  return null;
}

/**
 * Manual toast for showing notifications
 */
export function showNotificationToast(
  title: string,
  description: string,
  actionUrl?: string,
  actionText: string = "View"
) {
  const { toast } = useToast();

  toast({
    title,
    description,
    action: actionUrl ? (
      <a
        href={actionUrl}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
      >
        {actionText}
      </a>
    ) : undefined,
  });
}
