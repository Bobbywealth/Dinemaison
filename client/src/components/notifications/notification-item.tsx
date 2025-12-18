import { formatDistanceToNow } from "date-fns";
import { X, Check, Bell, CreditCard, MessageCircle, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/use-notifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const iconMap: Record<string, any> = {
  booking: Bell,
  payment: CreditCard,
  message: MessageCircle,
  review: Star,
  system: AlertCircle,
};

const colorMap: Record<string, string> = {
  low: "text-gray-500",
  normal: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = iconMap[notification.category] || Bell;
  const iconColor = colorMap[notification.priority] || "text-blue-500";

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to URL if provided
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-1 shrink-0", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.body}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!notification.isRead && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

