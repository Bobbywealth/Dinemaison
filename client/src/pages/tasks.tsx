import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, List, LayoutGrid, Search } from "lucide-react";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useTaskStats } from "@/hooks/use-tasks";
import { TaskStatus, TaskPriority, type TaskWithUser, type CreateTaskPayload } from "@shared/taskTypes";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [location, setLocation] = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  const view = (searchParams.get("view") as "list" | "kanban") || "kanban";
  
  const setView = (newView: "list" | "kanban") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    setLocation(`${location.split('?')[0]}?${params.toString()}`);
  };
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithUser | null>(null);

  const { toast } = useToast();

  // Prepare filters
  const filters = {
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter !== "all" ? (priorityFilter as TaskPriority) : undefined,
  };

  const { data: tasks = [], isLoading, refetch } = useTasks(filters);
  const { data: stats } = useTaskStats();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreateTask = (data: CreateTaskPayload) => {
    if (selectedTask) {
      // Update existing task
      updateTask.mutate(
        { taskId: selectedTask.id, payload: data },
        {
          onSuccess: () => {
            toast({
              title: "Task updated",
              description: "The task has been updated successfully.",
            });
            setDialogOpen(false);
            setSelectedTask(null);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update task",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new task
      createTask.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Task created",
            description: "A new task has been created successfully.",
          });
          setDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create task",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleEditTask = (task: TaskWithUser) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          toast({
            title: "Task deleted",
            description: "The task has been deleted successfully.",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete task",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleViewTask = (task: TaskWithUser) => {
    // For now, just open edit dialog
    // In future, could open a detailed view modal
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate(
      { taskId, payload: { status: newStatus } },
      {
        onSuccess: () => {
          toast({
            title: "Task updated",
            description: "Task status has been updated.",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update task status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleViewChange = (newView: string) => {
    setView(newView as "list" | "kanban");
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your team's tasks and projects</p>
        </div>
        <Button onClick={handleNewTask}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tasks</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>To Do</CardDescription>
              <CardTitle className="text-3xl">{stats.todo}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Review</CardDescription>
              <CardTitle className="text-3xl">{stats.review}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{stats.done}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={handleViewChange} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Tasks View */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      ) : view === "list" ? (
        <TaskListView
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      ) : (
        <TaskKanbanView
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTask}
        task={selectedTask}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}


