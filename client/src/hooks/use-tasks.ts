import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TaskWithUser,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskStats,
  TaskCommentWithUser,
} from "@shared/taskTypes";

export function useTasks(filters?: TaskFilters) {
  return useQuery<TaskWithUser[]>({
    queryKey: ["/api/tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
      if (filters?.createdBy) params.append("createdBy", filters.createdBy);
      if (filters?.search) params.append("search", filters.search);

      const response = await fetch(`/api/tasks?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });
}

export function useTask(taskId: string | undefined) {
  return useQuery<TaskWithUser>({
    queryKey: ["/api/tasks", taskId],
    queryFn: async () => {
      if (!taskId) throw new Error("Task ID is required");
      const response = await fetch(`/api/tasks/${taskId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch task");
      return response.json();
    },
    enabled: !!taskId,
  });
}

export function useTaskStats(userId?: string) {
  return useQuery<TaskStats>({
    queryKey: ["/api/tasks/stats", userId],
    queryFn: async () => {
      const params = userId ? `?userId=${userId}` : "";
      const response = await fetch(`/api/tasks/stats${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch task stats");
      return response.json();
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useTaskComments(taskId: string | undefined) {
  return useQuery<TaskCommentWithUser[]>({
    queryKey: ["/api/tasks", taskId, "comments"],
    queryFn: async () => {
      if (!taskId) throw new Error("Task ID is required");
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!taskId,
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, comment }: { taskId: string; comment: string }) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tasks", variables.taskId, "comments"],
      });
    },
  });
}


