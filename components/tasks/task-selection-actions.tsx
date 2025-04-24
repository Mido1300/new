"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, Trash2, X, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function TaskSelectionActions() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  const { selectedTasks, clearTaskSelection, toggleMultipleTasksCompletion, deleteMultipleTasks, tasks, editTask } =
    useAppStore()

  // Function to mark selected tasks as incomplete
  const markTasksAsIncomplete = () => {
    const taskCount = selectedTasks.length
    let completedCount = 0

    selectedTasks.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.completed) {
        editTask(taskId, { completed: false })
        completedCount++
      }
    })

    // Show toast notification
    if (completedCount > 0) {
      toast({
        title: "Tasks Updated",
        description: `${completedCount} ${completedCount === 1 ? "task" : "tasks"} marked as incomplete`,
        duration: 5000,
      })
    }

    clearTaskSelection()
  }

  // Function to mark selected tasks as complete
  const markTasksAsComplete = () => {
    const taskCount = selectedTasks.length

    toggleMultipleTasksCompletion(selectedTasks)

    // Show toast notification
    toast({
      title: "Tasks Updated",
      description: `${taskCount} ${taskCount === 1 ? "task" : "tasks"} marked as complete`,
      duration: 5000,
    })
  }

  // Function to delete selected tasks
  const handleDeleteTasks = () => {
    const taskCount = selectedTasks.length

    deleteMultipleTasks(selectedTasks)
    setDeleteDialogOpen(false)

    // Show toast notification
    toast({
      title: "Tasks Deleted",
      description: `${taskCount} ${taskCount === 1 ? "task" : "tasks"} deleted successfully`,
      duration: 5000,
    })
  }

  return (
    <>
      <Card className="mb-6 animate-slide-up shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="font-medium">
              <span className="text-lg font-bold text-primary">{selectedTasks.length}</span>{" "}
              {selectedTasks.length === 1 ? "task" : "tasks"} selected
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={markTasksAsComplete}
              >
                <Check className="h-4 w-4 mr-1" /> Mark Complete
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                onClick={markTasksAsIncomplete}
              >
                <XCircle className="h-4 w-4 mr-1" /> Mark Incomplete
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>

              <Button variant="outline" size="sm" onClick={clearTaskSelection}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedTasks.length} selected{" "}
              {selectedTasks.length === 1 ? "task" : "tasks"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDeleteTasks}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
