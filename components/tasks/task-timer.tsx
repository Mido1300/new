"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"
import { Pause, Play, Square, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function TaskTimer() {
  const { tasks, activeTimer, pauseTaskTimer, resumeTaskTimer, stopTaskTimer } = useAppStore()
  const { toast } = useToast()

  const [timeDisplay, setTimeDisplay] = useState("00:00:00")
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(!activeTimer.startTime)

  // Get task title
  const task = tasks.find((t) => t.id === activeTimer.taskId)
  const taskTitle = task?.title || "Task Timer"

  // Update timer display
  useEffect(() => {
    // Clear any existing interval
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    // Set initial display
    setTimeDisplay(formatTime(task?.timer || 0))

    // If this task has an active timer, start updating the display
    if (activeTimer.taskId && task) {
      const updateTimer = () => {
        let elapsed = task.timer || 0

        if (activeTimer.startTime) {
          const now = Date.now()
          elapsed += activeTimer.elapsed + (now - activeTimer.startTime)
        } else {
          elapsed += activeTimer.elapsed
        }

        setTimeDisplay(formatTime(elapsed))
      }

      // Update immediately
      updateTimer()

      // Then set interval
      setTimerInterval(setInterval(updateTimer, 1000))
    }

    // Cleanup function
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [activeTimer, task?.timer, timerInterval])

  // Handle pause/resume
  const handlePauseResume = () => {
    if (isPaused) {
      resumeTaskTimer()
      setIsPaused(false)

      // Show toast notification
      toast({
        title: "Timer Resumed",
        description: `Timer for "${taskTitle}" resumed`,
        duration: 3000,
      })
    } else {
      pauseTaskTimer()
      setIsPaused(true)

      // Show toast notification
      toast({
        title: "Timer Paused",
        description: `Timer for "${taskTitle}" paused at ${timeDisplay}`,
        duration: 3000,
      })
    }
  }

  // Handle stop
  const handleStop = () => {
    stopTaskTimer()

    // Show toast notification
    toast({
      title: "Timer Stopped",
      description: `Timer for "${taskTitle}" stopped at ${timeDisplay}`,
      duration: 3000,
    })
  }

  return (
    <Card className="fixed bottom-4 right-4 shadow-lg z-40 animate-slide-up border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-primary">{taskTitle}</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleStop}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{timeDisplay}</div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePauseResume}>
              {isPaused ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4 text-amber-500" />}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={handleStop}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
