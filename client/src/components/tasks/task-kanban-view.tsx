import { useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Calendar, User } from "lucide-react";
import type { TaskWithUser } from "@shared/taskTypes";
import { TaskStatus, TaskPriority } from "@shared/taskTypes";

interface TaskKanbanViewProps {
  tasks: TaskWithUser[];
  onEdit: (task: TaskWithUser) => void;
  onDelete: (taskId: string) => void;
  onView: (task: TaskWithUser) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskKanbanView({
  tasks,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}: TaskKanbanViewProps) {
  const columns = useMemo(
    () => [
      { id: TaskStatus.TODO, title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
      { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
      { id: TaskStatus.REVIEW, title: "Review", color: "bg-yellow-100 dark:bg-yellow-900" },
      { id: TaskStatus.DONE, title: "Done", color: "bg-green-100 dark:bg-green-900" },
    ],
    []
  );

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<TaskStatus, TaskWithUser[]>);
  }, [tasks, columns]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case TaskPriority.MEDIUM:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case TaskPriority.HIGH:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const isOverdue = (task: TaskWithUser) => {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.DONE;
  };

  const handleDragStart = (e: React.DragEvent, task: TaskWithUser) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col gap-3"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={`rounded-lg p-3 ${column.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{column.title}</h3>
              <Badge variant="secondary" className="bg-white/50 dark:bg-black/30">
                {tasksByStatus[column.id]?.length || 0}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-h-[400px]">
            {tasksByStatus[column.id]?.map((task) => (
              <Card
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className="cursor-move hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(task)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)} variant="secondary">
                      {task.priority.toUpperCase()}
                    </Badge>
                    {isOverdue(task) && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>

                  {(task.dueDate || task.assignedUser) && (
                    <div className="space-y-2 pt-2 border-t">
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className={isOverdue(task) ? "text-red-600 font-medium" : ""}>
                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}

                      {task.assignedUser && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={task.assignedUser.profileImageUrl || undefined}
                              alt={task.assignedUser.firstName || "User"}
                            />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(
                                task.assignedUser.firstName,
                                task.assignedUser.lastName
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
