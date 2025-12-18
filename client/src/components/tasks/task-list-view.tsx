import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import type { TaskWithUser } from "@shared/taskTypes";
import { TaskStatus, TaskPriority } from "@shared/taskTypes";

interface TaskListViewProps {
  tasks: TaskWithUser[];
  onEdit: (task: TaskWithUser) => void;
  onDelete: (taskId: string) => void;
  onView: (task: TaskWithUser) => void;
}

export function TaskListView({ tasks, onEdit, onDelete, onView }: TaskListViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowHeight = 88;
  const buffer = 5;
  const [range, setRange] = useState({ start: 0, end: Math.min(tasks.length, 20) });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateRange = () => {
      const scrollTop = node.scrollTop;
      const viewportHeight = node.clientHeight;
      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
      const endIndex = Math.min(
        tasks.length,
        startIndex + Math.ceil(viewportHeight / rowHeight) + buffer * 2,
      );

      setRange((prev) => {
        if (prev.start === startIndex && prev.end === endIndex) return prev;
        return { start: startIndex, end: endIndex };
      });
    };

    updateRange();
    node.addEventListener("scroll", updateRange);
    window.addEventListener("resize", updateRange);

    return () => {
      node.removeEventListener("scroll", updateRange);
      window.removeEventListener("resize", updateRange);
    };
  }, [tasks.length]);

  const visibleTasks = tasks.slice(range.start, range.end);
  const paddingTop = range.start * rowHeight;
  const paddingBottom = Math.max(tasks.length - range.end, 0) * rowHeight;

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case TaskStatus.REVIEW:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-md border max-h-[70vh] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <TableRow aria-hidden style={{ height: paddingTop }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
          {visibleTasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer" onClick={() => onView(task)}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ").toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                {task.assignedUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={task.assignedUser.profileImageUrl || undefined}
                        alt={task.assignedUser.firstName || "User"}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(task.assignedUser.firstName, task.assignedUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {task.assignedUser.firstName} {task.assignedUser.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {task.dueDate ? (
                  <div className={isOverdue(task) ? "text-red-600 font-medium" : ""}>
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                    {isOverdue(task) && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
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
              </TableCell>
            </TableRow>
          ))}
          {paddingBottom > 0 && (
            <TableRow aria-hidden style={{ height: paddingBottom }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
