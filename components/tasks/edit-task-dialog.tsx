"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppStore } from "@/lib/store"
import type { Task } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [subtaskInput, setSubtaskInput] = useState("")

  const { users, editTask, addNotification } = useAppStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title || "",
      description: task.description || "",
      category: task.category || "",
      priority: task.priority || "",
      dueDate: task.dueDate || "",
      assignedTo: task.assignedTo ? task.assignedTo.toString() : "",
      notes: task.notes || "",
    },
  })

  // Initialize subtasks
  useEffect(() => {
    if (open) {
      setSubtasks(task.subtasks || [])

      // Reset form with task values
      reset({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        priority: task.priority || "",
        dueDate: task.dueDate || "",
        assignedTo: task.assignedTo ? task.assignedTo.toString() : "",
        notes: task.notes || "",
      })
    }
  }, [open, task, reset])

  const onSubmit = (data: TaskFormValues) => {
    // Update task
    editTask(task.id, {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority as "High" | "Medium" | "Low",
      dueDate: data.dueDate,
      assignedTo: Number.parseInt(data.assignedTo),
      subtasks,
      notes: data.notes,
    })

    // Show toast notification
    toast({
      title: "Task Updated",
      description: `"${data.title}" has been updated successfully`,
      duration: 5000,
    })

    // Close dialog
    onOpenChange(false)
  }

  // Handle add subtask
  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()])
      setSubtaskInput("")
    }
  }

  // Handle remove subtask
  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = [...subtasks]
    newSubtasks.splice(index, 1)
    setSubtasks(newSubtasks)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Task description" {...register("description")} rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={task.category} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category" aria-invalid={errors.category ? "true" : "false"}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue={task.priority} onValueChange={(value) => setValue("priority", value)}>
                <SelectTrigger id="priority" aria-invalid={errors.priority ? "true" : "false"}>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                aria-invalid={errors.dueDate ? "true" : "false"}
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                defaultValue={task.assignedTo ? task.assignedTo.toString() : ""}
                onValueChange={(value) => setValue("assignedTo", value)}
              >
                <SelectTrigger id="assignedTo" aria-invalid={errors.assignedTo ? "true" : "false"}>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && <p className="text-sm text-red-500">{errors.assignedTo.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a subtask"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddSubtask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-2 mt-2">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                    <span>{subtask}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSubtask(index)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" placeholder="Additional notes or details" {...register("notes")} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
