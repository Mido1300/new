"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface UserTasksListProps {
  userId: number
  onBack: () => void
}

export function UserTasksList({ userId, onBack }: UserTasksListProps) {
  const { tasks, users } = useAppStore()

  // Get user
  const user = users.find((u) => u.id === userId)

  // Get tasks for this user
  const userTasks = tasks.filter((task) => task.assignedTo === userId)

  // Group tasks by status
  const completedTasks = userTasks.filter((task) => task.completed)
  const pendingTasks = userTasks.filter((task) => !task.completed)

  // Sort pending tasks by due date (closest first)
  pendingTasks.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime()
    const dateB = new Date(b.dueDate).getTime()
    return dateA - dateB
  })

  // Check for overdue tasks
  const now = new Date()
  const overdueTasks = pendingTasks.filter((task) => new Date(task.dueDate) < now)

  // Get priority stats
  const highPriorityCount = userTasks.filter((task) => task.priority === "High").length
  const mediumPriorityCount = userTasks.filter((task) => task.priority === "Medium").length
  const lowPriorityCount = userTasks.filter((task) => task.priority === "Low").length

  // Calculate completion rate
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Button>

        <h2 className="text-xl font-bold">{user?.name}'s Tasks</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{userTasks.length}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-500">{completedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-amber-500">{pendingTasks.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-red-500">{overdueTasks.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Priority distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800 mb-1"
              >
                High
              </Badge>
              <span className="text-xl font-bold">{highPriorityCount}</span>
            </div>

            <div className="flex flex-col items-center">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800 mb-1"
              >
                Medium
              </Badge>
              <span className="text-xl font-bold">{mediumPriorityCount}</span>
            </div>

            <div className="flex flex-col items-center">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800 mb-1"
              >
                Low
              </Badge>
              <span className="text-xl font-bold">{lowPriorityCount}</span>
            </div>

            <div className="ml-8 flex flex-col items-center">
              <span className="text-sm text-muted-foreground mb-1">Completion Rate</span>
              <span className="text-xl font-bold">{completionRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pending Tasks</h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-2">
            {pendingTasks.map((task) => {
              const isOverdue = new Date(task.dueDate) < now

              return (
                <Card key={task.id} className={`${isOverdue ? "border-l-4 border-l-red-500" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge
                        variant="outline"
                        className={`
                        ${task.priority === "High" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800" : ""}
                        ${task.priority === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800" : ""}
                        ${task.priority === "Low" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800" : ""}
                      `}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>

                      {isOverdue && (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>Overdue</span>
                        </div>
                      )}

                      {task.category && <Badge variant="secondary">{task.category}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">No pending tasks</div>
        )}

        <h3 className="text-lg font-semibold">Completed Tasks</h3>
        {completedTasks.length > 0 ? (
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium line-through text-muted-foreground">{task.title}</h4>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-300 dark:border-green-800"
                    >
                      Completed
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>

                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Done</span>
                    </div>

                    {task.timer > 0 && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{Math.round((task.timer / 3600000) * 10) / 10} hours</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">No completed tasks</div>
        )}
      </div>
    </div>
  )
}
