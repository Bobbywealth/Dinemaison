// Shared task types for admin task management

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null;
  createdBy: string;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithUser extends Task {
  assignedUser?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl?: string | null;
  } | null;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl?: string | null;
  };
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: Date;
}

export interface TaskCommentWithUser extends TaskComment {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl?: string | null;
  };
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: Date | string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: Date | string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  createdBy?: string;
  search?: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
}
