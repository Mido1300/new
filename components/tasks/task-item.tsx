"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store"
import type { Task } from "@/types"
import { formatTime, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EditTaskDialog } from "./edit-task-dialog"
import { ShareTaskDialog } from "./share-task-dialog"
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
import {
  Calendar,
  Pencil,
  Share2,
  TimerIcon as Stopwatch,
  Trash2,
  User,
  Clock,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
  Clock8,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Add role-based restrictions to task actions
import { useAuth } from "@/lib/hooks/use-auth"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [localTimeDisplay, setLocalTimeDisplay] = useState(formatTime(task.timer || 0))
  const { toast } = useToast()

  const {
    users,
    toggleTaskCompletion,
    deleteTask,
    toggleTaskSelection,
    selectedTasks,
    startTaskTimer,
    activeTimer,
    pauseTaskTimer,
    resumeTaskTimer,
  } = useAppStore()

  // Check if task has active timer
  const hasActiveTimer = activeTimer.taskId === task.id
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update timer display when active
  useEffect(() => {
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    // Set initial display
    setLocalTimeDisplay(formatTime(task.timer || 0))

    // If this task has an active timer, start updating the display
    if (hasActiveTimer) {
      const updateTimer = () => {
        let elapsed = task.timer || 0

        if (activeTimer.startTime) {
          const now = Date.now()
          elapsed += activeTimer.elapsed + (now - activeTimer.startTime)
        } else {
          elapsed += activeTimer.elapsed
        }

        setLocalTimeDisplay(formatTime(elapsed))
      }

      // Update immediately
      updateTimer()

      // Then set interval
      timerIntervalRef.current = setInterval(updateTimer, 1000)
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [hasActiveTimer, activeTimer, task.timer])

  // Get assignee
  const assignee = users.find((u) => u.id === task.assignedTo)

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700"
    }
  }

  // Check if task is selected
  const isSelected = selectedTasks.includes(task.id)

  // Calculate due date status
  const now = new Date()
  const dueDate = new Date(task.dueDate)
  const timeDiff = dueDate.getTime() - now.getTime()
  const daysDiff = timeDiff / (1000 * 3600 * 24)

  let dueDateStatus = {
    color: "green",
    text: `Due in ${Math.floor(daysDiff)} days`,
    icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
  }

  if (daysDiff < 0) {
    dueDateStatus = {
      color: "red",
      text: `Overdue by ${Math.abs(Math.floor(daysDiff))} days`,
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
    }
  } else if (daysDiff < 2) {
    dueDateStatus = {
      color: "yellow",
      text: daysDiff < 1 ? "Due today" : "Due tomorrow",
      icon: <Clock8 className="h-3.5 w-3.5 mr-1" />,
    }
  }

  // Handle task click to show due date notification
  const handleTaskClick = (e: React.MouseEvent) => {
    // Only show toast if not clicking on a button or switch
    if (!(e.target as HTMLElement).closest("button") && !(e.target as HTMLElement).closest('[role="switch"]')) {
      toggleTaskSelection(task.id)

      // Show toast notification with task details
      toast({
        title: "Task Selected",
        description: `"${task.title}" has been selected`,
        duration: 5000,
      })
    }
  }

  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id)
    
    // Show completion status notification
    toast({
      title: task.completed ? "Task Marked as Incomplete" : "Task Completed",
      description: `"${task.title}" has been ${task.completed ? "marked as incomplete" : "marked as complete"}`,
      duration: 5000,
    })
  }

  const handleDelete = () => {
    deleteTask(task.id)
    setDeleteDialogOpen(false)

    // Show delete notification
    toast({
      title: "Task Deleted",
      description: `"${task.title}" has been deleted`,
      duration: 5000,
      variant: "destructive",
    })
  }

  // Inside the component
  const { hasPermission } = useAuth()

  return (
    <>
      <div
        className={`p-3 sm:p-4 transition-all duration-300 border-l-4 shadow-sm hover:shadow-md rounded-r-md mb-2 ${
          task.completed
            ? "bg-green-50 dark:bg-green-900/20 border-green-500"
            : dueDateStatus.color === "red"
              ? "border-red-500 bg-red-50/30 dark:bg-red-900/10"
              : dueDateStatus.color === "yellow"
                ? "border-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/10"
                : "border-green-500 bg-white dark:bg-gray-800"
        } ${isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
        onClick={handleTaskClick}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={task.completed}
                    onCheckedChange={handleToggleCompletion}
                    className={`${task.completed ? "data-[state=checked]:bg-green-500" : ""} bg-black dark:bg-white`}
                  />
                </TooltipTrigger>
                <TooltipContent>{task.completed ? "Mark as incomplete" : "Mark as complete"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </h3>
                <p className="text-muted-foreground mb-3">{task.description}</p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="rounded-md px-2 py-1 border">
                    {task.category}
                  </Badge>
                  <Badge className={`${getPriorityColor(task.priority)} rounded-md px-2 py-1 border`}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 rounded-md px-2 py-1 border">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </Badge>

                  <Badge
                    className={`rounded-md px-2 py-1 border flex items-center ${
                      dueDateStatus.color === "red"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800"
                        : dueDateStatus.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800"
                    }`}
                  >
                    {dueDateStatus.icon}
                    {dueDateStatus.text}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    <span>{assignee?.name || "Unassigned"}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{localTimeDisplay}</span>
                  </div>
                </div>

                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium mb-1">Subtasks:</p>
                    {task.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mr-2"></div>
                        <span>{subtask}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end mt-3 pt-3 border-t dark:border-gray-700 gap-2">
              <div
                className="flex flex-wrap items-center space-x-0 sm:space-x-2 gap-2 sm:gap-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-2 sm:px-3 text-xs sm:text-sm ${
                    activeTimer.taskId === task.id ? "border-amber-500 text-amber-600 dark:text-amber-400" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (activeTimer.taskId === task.id) {
                      if (activeTimer.startTime) {
                        pauseTaskTimer()
                      } else {
                        resumeTaskTimer()
                      }
                    } else {
                      startTaskTimer(task.id)
                    }
                  }}
                >
                  {activeTimer.taskId === task.id ? (
                    activeTimer.startTime ? (
                      <>
                        <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-amber-500" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-amber-500" />
                        <span className="hidden sm:inline">Resume</span>
                      </>
                    )
                  ) : (
                    <>
                      <Stopwatch className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Start Timer</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShareDialogOpen(true)
                  }}
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                {hasPermission(users[0], "Staff") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                )}

                {hasPermission(users[0], "Manager") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 sm:px-3 text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditTaskDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} task={task} />

      <ShareTaskDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} taskId={task.id} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the task "{task.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
