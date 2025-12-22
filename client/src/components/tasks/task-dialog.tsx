import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { TaskWithUser, CreateTaskPayload } from "@shared/taskTypes";
import { TaskStatus, TaskPriority } from "@shared/taskTypes";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskPayload) => void;
  task?: TaskWithUser | null;
  isSubmitting?: boolean;
}

export function TaskDialog({ open, onOpenChange, onSubmit, task, isSubmitting }: TaskDialogProps) {
  const form = useForm<CreateTaskPayload>({
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assignedTo: undefined,
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : undefined,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assignedTo: undefined,
        dueDate: undefined,
      });
    }
  }, [task, form, open]);

  const handleSubmit = (data: CreateTaskPayload) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                        <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


