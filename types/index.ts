export type User = {
  id: number
  name: string
  email: string
  password: string // In a real app, this would not be stored in the client
  phone: string
  country: string
  role: "Manager" | "Admin" | "Staff" | "Customer"
  avatar: string
  bio?: string
}

export type Task = {
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

export type Notification = {
  id: number
  title: string
  message: string
  read: boolean
}

export type TaskFilters = {
  search: string
  category: string
  priority: string
  status: string
  dateRange: {
    start: string | null
    end: string | null
  }
}

export type TaskSort = {
  by: "dueDate" | "priority" | "title" | "created"
  direction: "asc" | "desc"
}

export type UserStatus = "online" | "break" | "shadow" | "offline"

type AppState = {
  // Task actions
  addTask: (task: Task) => void
  deleteTask: (taskId: number) => void
  deleteMultipleTasks: (taskIds: number[]) => void
  editTask: (taskId: number, updatedTask: Partial<Task>) => void
  toggleTaskCompletion: (taskId: number) => void
  toggleMultipleTasksCompletion: (taskIds: number[]) => void
  reorderTasks: (sourceId: number, targetId: number) => void
  setTaskOrder: (newTasksOrder: Task[]) => void // Add this line
}
