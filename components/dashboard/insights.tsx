"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, Clock, Calendar, AlertTriangle, CheckCircle2, Zap, Award } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface Task {
  id: number
  title: string
  description: string
  category: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
  completed: boolean
  assignedTo: number
  subtasks: string[]
  notes?: string
  created: string
  timer: number
}

interface CategoryInsights {
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  averageTime: number
  totalTime: number
}

export function Insights() {
  const { tasks } = useAppStore()

  // Calculate productivity score
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate upcoming deadlines
  const now = new Date()
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setDate(now.getDate() + 2)

  const upcomingDeadlines = tasks.filter((task) => {
    if (task.completed) return false

    const dueDate = new Date(task.dueDate)
    return dueDate >= now && dueDate <= twoDaysFromNow
  }).length

  // Calculate overdue tasks
  const overdueTasks = tasks.filter((task) => {
    if (task.completed) return false

    const dueDate = new Date(task.dueDate)
    return dueDate < now
  }).length

  // Calculate average completion time
  const completedTasksWithTimer = tasks.filter((t) => t.completed && t.timer > 0)
  const avgCompletionTime =
    completedTasksWithTimer.length > 0
      ? completedTasksWithTimer.reduce((sum, task) => sum + task.timer, 0) / completedTasksWithTimer.length
      : 0

  // Calculate total time spent
  const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timer || 0), 0)

  // Calculate most productive category
  const insights = tasks.reduce((acc: Record<string, CategoryInsights>, task) => {
    if (!task.category) return acc
    
    if (!acc[task.category]) {
      acc[task.category] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        completionRate: 0,
        averageTime: 0,
        totalTime: 0
      }
    }
    
    const category = acc[task.category]
    if (!category) return acc
    
    category.total++
    
    if (task.completed) {
      category.completed++
      if (task.created) {
        const completionTime = new Date().getTime() - new Date(task.created).getTime()
        category.totalTime += completionTime
        category.averageTime = category.totalTime / category.completed
      }
    } else {
      category.inProgress++
    }
    
    if (task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) {
      category.overdue++
    }
    
    category.completionRate = (category.completed / category.total) * 100
    
    return acc
  }, {})

  let mostProductiveCategory = { name: "None", rate: 0 }

  Object.entries(insights).forEach(([category, counts]) => {
    const completionRate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0
    if (completionRate > mostProductiveCategory.rate && counts.total >= 2) {
      mostProductiveCategory = { name: category, rate: completionRate }
    }
  })

  // Calculate priority distribution
  const highPriorityCompleted = tasks.filter((t) => t.priority === "High" && t.completed).length
  const highPriorityTotal = tasks.filter((t) => t.priority === "High").length
  const highPriorityRate = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 100 : 0

  const recentTasks = tasks
    .filter((t) => {
      const taskDate = new Date(t.created)
      const today = new Date()
      const weekStart = new Date()
      weekStart.setDate(today.getDate() - 7)
      return taskDate >= weekStart
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5)

  return (
    <Card className="mb-8 animate-fade-in">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Productivity Score</h3>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mr-2">{productivityScore}%</div>
                <div className="text-green-500 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>5%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Based on your task completion rate</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">Time Management</h3>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-300 mr-2">
                  {formatTime(Math.round(avgCompletionTime))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Average time per completed task</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-amber-700 dark:text-amber-300">Upcoming Deadlines</h3>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">{upcomingDeadlines}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tasks due in the next 48 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-300 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" /> Overdue Tasks
              </h3>
              <div className="text-2xl font-bold text-red-600 dark:text-red-300">{overdueTasks}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tasks that have passed their due date</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Most Productive Category
              </h3>
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">{mostProductiveCategory.name}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {mostProductiveCategory.rate.toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Total Time Invested
              </h3>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {formatTime(totalTimeSpent)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Across all tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-cyan-700 dark:text-cyan-300 flex items-center">
                <Zap className="h-4 w-4 mr-1" /> High Priority Completion
              </h3>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">{highPriorityRate.toFixed(0)}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {highPriorityCompleted} of {highPriorityTotal} high priority tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-rose-700 dark:text-rose-300 flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Weekly Progress
              </h3>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-300">
                {
                  tasks.filter((t) => {
                    const taskDate = new Date(t.created)
                    const today = new Date()
                    const weekStart = new Date()
                    weekStart.setDate(today.getDate() - today.getDay())
                    return taskDate >= weekStart && t.completed
                  }).length
                }
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tasks completed this week</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-teal-700 dark:text-teal-300 flex items-center">
                <Award className="h-4 w-4 mr-1" /> Efficiency Score
              </h3>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-300">
                {Math.min(100, Math.round((completedTasks / Math.max(1, totalTasks - overdueTasks)) * 100))}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Based on completion rate and timeliness</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
