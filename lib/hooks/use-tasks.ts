// Create a custom hook for tasks
"use client"

import { useAppStore } from "@/lib/store"

export function useTasks() {
  const { tasks, addTask, deleteTask, editTask, toggleTaskCompletion, filters, sort } = useAppStore()

  // Get filtered and sorted tasks
  const getFilteredTasks = () => {
    return tasks
      .filter((task) => {
        // Search filter
        if (filters.search && filters.search.trim() !== "") {
          const searchTerm = filters.search.toLowerCase()
          const titleMatch = task.title.toLowerCase().includes(searchTerm)
          const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) || false

          if (!titleMatch && !descriptionMatch) {
            return false
          }
        }

        // Category filter
        if (filters.category && filters.category !== "all" && task.category !== filters.category) {
          return false
        }

        // Priority filter
        if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
          return false
        }

        // Status filter
        if (filters.status === "Completed" && !task.completed) return false
        if (filters.status === "Active" && task.completed) return false

        // Date range filter
        if (filters.dateRange.start && filters.dateRange.end) {
          const taskDate = new Date(task.dueDate)
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)

          // Set time to beginning and end of day for proper comparison
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)

          if (taskDate < startDate || taskDate > endDate) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sort.by === "none") return 0

        let result = 0

        switch (sort.by) {
          case "dueDate":
            // Handle potential null/undefined values
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
            result = dateA - dateB
            break
          case "priority": {
            // Define priority order with explicit values
            const priorityOrder = { High: 0, Medium: 1, Low: 2 }
            const priorityA = priorityOrder[a.priority] ?? 999
            const priorityB = priorityOrder[b.priority] ?? 999
            result = priorityA - priorityB
            break
          }
          case "title":
            // Handle potential null/undefined values
            result = (a.title || "").localeCompare(b.title || "")
            break
          case "created":
            // Handle potential null/undefined values
            const createdA = a.created ? new Date(a.created).getTime() : 0
            const createdB = b.created ? new Date(b.created).getTime() : 0
            result = createdA - createdB
            break
          default:
            result = 0
        }

        // Apply sort direction
        return sort.direction === "asc" ? result : -result
      })
  }

  return {
    tasks,
    filteredTasks: getFilteredTasks(),
    addTask,
    deleteTask,
    editTask,
    toggleTaskCompletion,
  }
}
