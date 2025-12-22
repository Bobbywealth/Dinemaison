import { db } from "./db";
import { tasks, taskComments, users } from "@shared/schema";
import { eq, and, or, desc, asc, sql, like, lte } from "drizzle-orm";
import { logger } from "./lib/logger";
import type {
  Task,
  TaskWithUser,
  TaskComment,
  TaskCommentWithUser,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskStats,
  TaskStatus,
} from "@shared/taskTypes";

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: TaskFilters): Promise<TaskWithUser[]> {
  try {
    let query = db
      .select({
        task: tasks,
        assignedUser: users,
        creator: users,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .$dynamic();

    // Apply filters
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }

    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }

    if (filters?.assignedTo) {
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    }

    if (filters?.createdBy) {
      conditions.push(eq(tasks.createdBy, filters.createdBy));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(tasks.title, `%${filters.search}%`),
          like(tasks.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(tasks.createdAt));

    // Transform results
    const tasksWithUsers: TaskWithUser[] = [];
    const taskMap = new Map<string, TaskWithUser>();

    for (const row of results) {
      if (!taskMap.has(row.task.id)) {
        const taskWithUser: TaskWithUser = {
          ...row.task,
          assignedUser: null,
          creator: {
            id: "",
            firstName: null,
            lastName: null,
            email: "",
            profileImageUrl: null,
          },
        };

        tasksWithUsers.push(taskWithUser);
        taskMap.set(row.task.id, taskWithUser);
      }

      const task = taskMap.get(row.task.id)!;

      // Set assigned user
      if (row.assignedUser && row.task.assignedTo === row.assignedUser.id) {
        task.assignedUser = {
          id: row.assignedUser.id,
          firstName: row.assignedUser.firstName,
          lastName: row.assignedUser.lastName,
          email: row.assignedUser.email,
          profileImageUrl: row.assignedUser.profileImageUrl,
        };
      }

      // Set creator
      if (row.creator && row.task.createdBy === row.creator.id) {
        task.creator = {
          id: row.creator.id,
          firstName: row.creator.firstName,
          lastName: row.creator.lastName,
          email: row.creator.email,
          profileImageUrl: row.creator.profileImageUrl,
        };
      }
    }

    return tasksWithUsers;
  } catch (error) {
    logger.error("Error getting tasks:", error);
    throw error;
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(taskId: string): Promise<TaskWithUser | null> {
  try {
    const result = await db
      .select({
        task: tasks,
        assignedUser: users,
        creator: users,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      ...row.task,
      assignedUser: row.assignedUser
        ? {
            id: row.assignedUser.id,
            firstName: row.assignedUser.firstName,
            lastName: row.assignedUser.lastName,
            email: row.assignedUser.email,
            profileImageUrl: row.assignedUser.profileImageUrl,
          }
        : null,
      creator: row.creator
        ? {
            id: row.creator.id,
            firstName: row.creator.firstName,
            lastName: row.creator.lastName,
            email: row.creator.email,
            profileImageUrl: row.creator.profileImageUrl,
          }
        : {
            id: "",
            firstName: null,
            lastName: null,
            email: "",
            profileImageUrl: null,
          },
    };
  } catch (error) {
    logger.error("Error getting task by ID:", error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(
  payload: CreateTaskPayload,
  createdBy: string
): Promise<Task> {
  try {
    const [task] = await db
      .insert(tasks)
      .values({
        title: payload.title,
        description: payload.description,
        status: payload.status || "todo",
        priority: payload.priority || "medium",
        assignedTo: payload.assignedTo,
        createdBy,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      })
      .returning();

    logger.info("Task created", { taskId: task.id, createdBy });
    return task;
  } catch (error) {
    logger.error("Error creating task:", error);
    throw error;
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task | null> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.assignedTo !== undefined) updateData.assignedTo = payload.assignedTo;
    if (payload.dueDate !== undefined) {
      updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
    }

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!task) {
      return null;
    }

    logger.info("Task updated", { taskId });
    return task;
  } catch (error) {
    logger.error("Error updating task:", error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const result = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (result.length === 0) {
      return false;
    }

    logger.info("Task deleted", { taskId });
    return true;
  } catch (error) {
    logger.error("Error deleting task:", error);
    throw error;
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats(userId?: string): Promise<TaskStats> {
  try {
    let query = db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .$dynamic();

    if (userId) {
      query = query.where(
        or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId))
      );
    }

    const statusCounts = await query.groupBy(tasks.status);

    // Count overdue tasks
    const overdueQuery = db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(
        and(
          lte(tasks.dueDate, new Date()),
          or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress"))
        )
      );

    const [overdueResult] = userId
      ? await overdueQuery.where(
          or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId))
        )
      : await overdueQuery;

    const stats: TaskStats = {
      total: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      overdue: overdueResult?.count || 0,
    };

    for (const row of statusCounts) {
      stats.total += row.count;
      switch (row.status) {
        case "todo":
          stats.todo = row.count;
          break;
        case "in_progress":
          stats.inProgress = row.count;
          break;
        case "review":
          stats.review = row.count;
          break;
        case "done":
          stats.done = row.count;
          break;
      }
    }

    return stats;
  } catch (error) {
    logger.error("Error getting task stats:", error);
    throw error;
  }
}

/**
 * Get comments for a task
 */
export async function getTaskComments(taskId: string): Promise<TaskCommentWithUser[]> {
  try {
    const results = await db
      .select({
        comment: taskComments,
        user: users,
      })
      .from(taskComments)
      .innerJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, taskId))
      .orderBy(asc(taskComments.createdAt));

    return results.map((row) => ({
      ...row.comment,
      user: {
        id: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        email: row.user.email,
        profileImageUrl: row.user.profileImageUrl,
      },
    }));
  } catch (error) {
    logger.error("Error getting task comments:", error);
    throw error;
  }
}

/**
 * Add a comment to a task
 */
export async function addTaskComment(
  taskId: string,
  userId: string,
  comment: string
): Promise<TaskComment> {
  try {
    const [newComment] = await db
      .insert(taskComments)
      .values({
        taskId,
        userId,
        comment,
      })
      .returning();

    logger.info("Task comment added", { taskId, commentId: newComment.id });
    return newComment;
  } catch (error) {
    logger.error("Error adding task comment:", error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteTaskComment(commentId: string): Promise<boolean> {
  try {
    const result = await db
      .delete(taskComments)
      .where(eq(taskComments.id, commentId))
      .returning();

    if (result.length === 0) {
      return false;
    }

    logger.info("Task comment deleted", { commentId });
    return true;
  } catch (error) {
    logger.error("Error deleting task comment:", error);
    throw error;
  }
}


