import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: any;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/in-app"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/in-app/unread-count"],
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  const unreadCount = unreadData?.count || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/in-app/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app/unread-count"] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/in-app/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app/unread-count"] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app/unread-count"] });
    },
  };
}

// WebSocket hook for real-time notifications
export function useNotificationWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Determine WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected for notifications");
      setIsConnected(true);

      // Authenticate (if you have user info available)
      // websocket.send(JSON.stringify({ type: "auth", payload: { userId: "..." } }));
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle notification events
        if (message.type === "notification:new") {
          // Refresh notifications
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app/unread-count"] });
        } else if (message.type === "notification:read" || message.type === "notification:deleted") {
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/in-app/unread-count"] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [queryClient]);

  return { ws, isConnected };
}



