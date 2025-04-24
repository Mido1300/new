"use client"

import { useAppStore } from "@/lib/store"
import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TaskStats() {
  const { tasks } = useAppStore()

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks

  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-bold">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2" />
            <div>
              <p className="text-xl sm:text-3xl font-bold">{totalTasks}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">All tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-bold">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2" />
              <div>
                <p className="text-xl sm:text-3xl font-bold">{completedTasks}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{completionPercentage}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-bold">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 mr-2" />
              <div>
                <p className="text-xl sm:text-3xl font-bold">{pendingTasks}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{pendingPercentage}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
