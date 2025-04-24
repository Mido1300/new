"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task, User, Notification, TaskFilters, UserStatus } from "@/types"
import { mockTasks, mockUsers, mockNotifications } from "./mock-data"

type SortBy = "priority" | "dueDate" | "title" | "created"

interface TaskSort {
  by: SortBy
  direction: "asc" | "desc"
}

type HistoryAction =
  | { type: "addTask"; task: Task }
  | { type: "deleteTask"; task: Task }
  | { type: "deleteMultipleTasks"; tasks: Task[] }
  | { type: "editTask"; taskId: number; previousState: Task }
  | { type: "toggleCompletion"; taskId: number; previousState: boolean }
  | { type: "bulkToggleCompletion"; taskIds: number[]; previousState: Record<number, boolean> }
  | { type: "reorderTasks"; previousTasks: Task[]; newTasks: Task[] }

interface ActiveTimer {
  taskId: number | null
  startTime: number | null
  elapsed: number
}

type WorkTimer = {
  startTime: Date | null
  elapsed: number
}

type AppState = {
  currentUser: User | null
  users: User[]
  tasks: Task[]
  notifications: Notification[]
  status: UserStatus
  filters: TaskFilters
  sort: TaskSort
  view: "list" | "graph"
  selectedTasks: number[]
  activeTimer: ActiveTimer
  workTimer: WorkTimer
  darkMode: boolean
  history: {
    actions: HistoryAction[]
    position: number
  }
  sortDirection: "asc" | "desc"

  // Auth actions
  setCurrentUser: (user: User | null) => void
  updateUser: (user: User) => void

  // Task actions
  addTask: (task: Task) => void
  deleteTask: (taskId: number) => void
  deleteMultipleTasks: (taskIds: number[]) => void
  editTask: (taskId: number, updatedTask: Partial<Task>) => void
  toggleTaskCompletion: (taskId: number) => void
  toggleMultipleTasksCompletion: (taskIds: number[]) => void
  reorderTasks: (sourceId: number, targetId: number) => void

  // Selection actions
  toggleTaskSelection: (taskId: number) => void
  clearTaskSelection: () => void

  // Timer actions
  startTaskTimer: (taskId: number) => void
  pauseTaskTimer: () => void
  resumeTaskTimer: () => void
  stopTaskTimer: () => void

  // Work timer actions
  startWorkTimer: () => void
  pauseWorkTimer: () => void
  stopWorkTimer: () => void

  // Filter actions
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  setDateRange: (start: string | null, end: string | null) => void
  clearFilters: () => void

  // Sort actions
  setSort: (by: TaskSort["by"], direction?: TaskSort["direction"]) => void

  // View actions
  setView: (view: "list" | "graph") => void

  // Status actions
  setStatus: (status: UserStatus) => void

  // Theme actions
  toggleDarkMode: () => void

  // History actions
  undo: () => void
  redo: () => void

  // Notification actions
  markNotificationAsRead: (id: number) => void
  markAllNotificationsAsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "read">) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      tasks: mockTasks,
      notifications: mockNotifications,
      status: "online",
      filters: {
        search: "",
        category: "",
        priority: "",
        status: "",
        dateRange: { start: null, end: null },
      },
      sort: {
        by: "created",
        direction: "asc",
      },
      view: "list",
      selectedTasks: [],
      activeTimer: {
        taskId: null,
        startTime: null,
        elapsed: 0,
      },
      workTimer: {
        startTime: null,
        elapsed: 0,
      },
      darkMode: false,
      history: {
        actions: [],
        position: -1,
      },
      sortDirection: "asc",

      // Auth actions
      setCurrentUser: (user) => set({ currentUser: user }),

      updateUser: (user) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === user.id ? user : u)),
        }))
      },

      // Task actions
      addTask: (task) => {
        const { tasks, history } = get()
        const newTask = {
          ...task,
          id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        }

        // Add to history
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "addTask" as const, task: newTask }
          ],
          position: history.position + 1,
        }

        set({
          tasks: [...tasks, newTask],
          history: newHistory,
        })
      },

      deleteTask: (taskId) => {
        const { tasks, history } = get()
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        const newTasks = tasks.filter((t) => t.id !== taskId)
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "deleteTask" as const, task }
          ],
          position: history.position + 1,
        }

        set({
          tasks: newTasks,
          history: newHistory,
        })
      },

      deleteMultipleTasks: (taskIds) => {
        const { tasks, history } = get()
        const tasksToDelete = tasks.filter((t) => taskIds.includes(t.id))
        const newTasks = tasks.filter((t) => !taskIds.includes(t.id))
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "deleteMultipleTasks" as const, tasks: tasksToDelete }
          ],
          position: history.position + 1,
        }

        set({
          tasks: newTasks,
          history: newHistory,
        })
      },

      editTask: (taskId, updates) => {
        const { tasks, history } = get()
        const taskIndex = tasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) return

        const previousTask = { ...tasks[taskIndex] }
        const updatedTask = { ...tasks[taskIndex], ...updates }

        const newTasks = [...tasks]
        newTasks[taskIndex] = updatedTask

        // Add to history
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "editTask" as const, taskId, previousState: previousTask }
          ],
          position: history.position + 1,
        }

        set({ tasks: newTasks, history: newHistory })
      },

      toggleTaskCompletion: (taskId) => {
        const { tasks, history } = get()
        const taskIndex = tasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) return

        const previousState = tasks[taskIndex].completed
        const newTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )

        // Add to history
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "toggleCompletion" as const, taskId, previousState }
          ],
          position: history.position + 1,
        }

        set({ tasks: newTasks, history: newHistory })
      },

      toggleMultipleTasksCompletion: (taskIds) => {
        const { tasks, history } = get()
        const previousState = taskIds.reduce((acc, id) => {
          const task = tasks.find((t) => t.id === id)
          if (task) {
            acc[id] = task.completed
          }
          return acc
        }, {} as Record<number, boolean>)

        const newTasks = tasks.map((task) =>
          taskIds.includes(task.id)
            ? { ...task, completed: !task.completed }
            : task
        )

        // Add to history
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { type: "bulkToggleCompletion" as const, taskIds, previousState }
          ],
          position: history.position + 1,
        }

        set({ tasks: newTasks, history: newHistory })
      },

      // Improved reorderTasks function to handle drag and drop perfectly
      reorderTasks: (sourceId, targetId) => {
        const { tasks, history } = get()

        // Store the original tasks for history
        const originalTasks = [...tasks]

        // Find source and target indices
        const sourceIndex = tasks.findIndex((t) => t.id === sourceId)
        const targetIndex = tasks.findIndex((t) => t.id === targetId)

        // If either task is not found, do nothing
        if (sourceIndex === -1 || targetIndex === -1) return

        // Create a new array and remove the source task
        const newTasks = [...tasks]
        const [movedTask] = newTasks.splice(sourceIndex, 1)

        // Insert at the target position
        newTasks.splice(targetIndex, 0, movedTask)

        // Add to history with both previous and new state
        const newHistory = {
          actions: [
            ...history.actions.slice(0, history.position + 1),
            { 
              type: "reorderTasks" as const, 
              previousTasks: originalTasks,
              newTasks: newTasks
            },
          ],
          position: history.position + 1,
        }

        // Update the state with the new order and reset sort
        set({
          tasks: newTasks,
          history: newHistory,
          sort: {
            by: "created",
            direction: "asc"
          }
        })
      },

      // Selection actions
      toggleTaskSelection: (taskId) => {
        const { selectedTasks } = get()
        const index = selectedTasks.indexOf(taskId)

        if (index > -1) {
          set({ selectedTasks: selectedTasks.filter((id) => id !== taskId) })
        } else {
          set({ selectedTasks: [...selectedTasks, taskId] })
        }
      },

      clearTaskSelection: () => set({ selectedTasks: [] }),

      // Timer actions
      startTaskTimer: (taskId) => {
        const { tasks } = get()
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        set({
          activeTimer: {
            taskId,
            startTime: Date.now(),
            elapsed: 0
          },
        })
      },

      pauseTaskTimer: () => {
        const { activeTimer } = get()
        if (activeTimer.taskId === null || activeTimer.startTime === null) return

        const elapsedTime = Math.floor((Date.now() - activeTimer.startTime) / 1000)
        const newTasks = get().tasks.map((task) =>
          task.id === activeTimer.taskId
            ? { ...task, timer: task.timer + elapsedTime }
            : task
        )

        set({
          tasks: newTasks,
          activeTimer: {
            taskId: null,
            startTime: null,
            elapsed: 0
          },
        })
      },

      resumeTaskTimer: () => {
        const { activeTimer } = get()
        if (activeTimer.taskId === null || activeTimer.startTime === null) return

        set({
          activeTimer: {
            ...activeTimer,
            startTime: Date.now(),
          },
        })
      },

      stopTaskTimer: () => {
        const { activeTimer, tasks } = get()
        if (activeTimer.taskId === null || activeTimer.startTime === null) return

        const task = tasks.find((t) => t.id === activeTimer.taskId)
        if (!task) return

        const elapsedTime = Math.floor((Date.now() - activeTimer.startTime) / 1000)
        const newTasks = tasks.map((t) =>
          t.id === activeTimer.taskId
            ? { ...t, timer: t.timer + elapsedTime }
            : t
        )

        set({
          tasks: newTasks,
          activeTimer: {
            taskId: null,
            startTime: null,
            elapsed: 0
          },
        })
      },

      // Work timer actions
      startWorkTimer: () => {
        const { workTimer } = get()

        set({
          workTimer: {
            startTime: new Date(),
            elapsed: workTimer.elapsed,
          },
        })
      },

      pauseWorkTimer: () => {
        const { workTimer } = get()

        if (!workTimer.startTime) return

        const now = new Date()
        const elapsed = workTimer.elapsed + (now.getTime() - workTimer.startTime.getTime())

        set({
          workTimer: {
            startTime: null,
            elapsed,
          },
        })
      },

      stopWorkTimer: () => {
        set({
          workTimer: {
            startTime: null,
            elapsed: 0,
          },
        })
      },

      // Filter actions
      setFilter: (key, value) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        }))
      },

      setDateRange: (start, end) => {
        set((state) => ({
          filters: {
            ...state.filters,
            dateRange: { start, end },
          },
        }))
      },

      clearFilters: () => {
        set({
          filters: {
            search: "",
            category: "",
            priority: "",
            status: "",
            dateRange: { start: null, end: null },
          },
        })
      },

      // Sort actions
      setSort: (by, direction) => {
        set((state) => ({
          sort: {
            by: by || state.sort.by,
            direction: direction !== undefined ? direction : state.sort.direction,
          },
        }))
      },

      // View actions
      setView: (view) => set({ view }),

      // Status actions
      setStatus: (status) => {
        set({ status })

        // Handle work timer based on status
        if (status === "online") {
          get().startWorkTimer()
        } else if (status === "break" || status === "shadow") {
          get().pauseWorkTimer()
        } else {
          get().stopWorkTimer()
        }
      },

      // Theme actions
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // History actions
      undo: () => {
        const { history, tasks } = get()

        if (history.position < 0) return

        const action = history.actions[history.position]
        let newTasks = [...tasks]

        // Perform undo based on action type
        switch (action.type) {
          case "addTask":
            newTasks = newTasks.filter((t) => t.id !== action.task.id)
            break

          case "deleteTask":
            newTasks.push(action.task)
            break

          case "deleteMultipleTasks":
            newTasks.push(...action.tasks)
            break

          case "editTask":
            const editIndex = newTasks.findIndex((t) => t.id === action.taskId)
            if (editIndex !== -1) {
              newTasks[editIndex] = { ...action.previousState }
            }
            break

          case "toggleCompletion":
            const toggleIndex = newTasks.findIndex((t) => t.id === action.taskId)
            if (toggleIndex !== -1) {
              newTasks[toggleIndex] = {
                ...newTasks[toggleIndex],
                completed: action.previousState,
              }
            }
            break

          case "bulkToggleCompletion":
            action.taskIds.forEach((id) => {
              const taskIndex = newTasks.findIndex((t) => t.id === id)
              if (taskIndex !== -1) {
                newTasks[taskIndex] = {
                  ...newTasks[taskIndex],
                  completed: action.previousState[id],
                }
              }
            })
            break

          case "reorderTasks":
            // Use the stored previous state for undo
            newTasks = [...action.previousTasks]
            break
        }

        set({
          tasks: newTasks,
          history: {
            ...history,
            position: history.position - 1,
          },
        })
      },

      redo: () => {
        const { history, tasks } = get()

        if (history.position >= history.actions.length - 1) return

        const nextPosition = history.position + 1
        const action = history.actions[nextPosition]
        let newTasks = [...tasks]

        // Perform redo based on action type
        switch (action.type) {
          case "addTask":
            newTasks.push(action.task)
            break

          case "deleteTask":
            newTasks = newTasks.filter((t) => t.id !== action.task.id)
            break

          case "deleteMultipleTasks":
            const deleteIds = action.tasks.map((t) => t.id)
            newTasks = newTasks.filter((t) => !deleteIds.includes(t.id))
            break

          case "editTask":
            const editIndex = newTasks.findIndex((t) => t.id === action.taskId)
            if (editIndex !== -1) {
              // Since we stored the previous state, we need to determine the changes
              // For simplicity, we'll just remove the task from the array
              newTasks = newTasks.filter((t) => t.id !== action.taskId)

              // Find the current state in the tasks array
              const currentTask = tasks.find((t) => t.id === action.taskId)
              if (currentTask) {
                newTasks.push(currentTask)
              }
            }
            break

          case "toggleCompletion":
            const toggleIndex = newTasks.findIndex((t) => t.id === action.taskId)
            if (toggleIndex !== -1) {
              newTasks[toggleIndex] = {
                ...newTasks[toggleIndex],
                completed: !action.previousState,
              }
            }
            break

          case "bulkToggleCompletion":
            action.taskIds.forEach((id) => {
              const taskIndex = newTasks.findIndex((t) => t.id === id)
              if (taskIndex !== -1) {
                newTasks[taskIndex] = {
                  ...newTasks[taskIndex],
                  completed: !action.previousState[id],
                }
              }
            })
            break

          case "reorderTasks":
            // Use the stored new state for redo
            newTasks = [...action.newTasks]
            break
        }

        set({
          tasks: newTasks,
          history: {
            ...history,
            position: nextPosition,
          },
        })
      },

      // Notification actions
      markNotificationAsRead: (id) => {
        const { notifications } = get()
        const newNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))

        set({ notifications: newNotifications })
      },

      markAllNotificationsAsRead: () => {
        const { notifications } = get()
        const newNotifications = notifications.map((n) => ({ ...n, read: true }))

        set({ notifications: newNotifications })
      },

      addNotification: (notification) => {
        const { notifications } = get()
        const newNotification = {
          id: notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1,
          ...notification,
          read: false,
        }

        set({ notifications: [newNotification, ...notifications] })
      },
    }),
    {
      name: "todo-app-storage",
      partialize: (state) => ({
        tasks: state.tasks,
        darkMode: state.darkMode,
        sort: state.sort,
        view: state.view,
        users: state.users,
        currentUser: state.currentUser,
        notifications: state.notifications,
        status: state.status,
        filters: state.filters,
        selectedTasks: state.selectedTasks,
        activeTimer: state.activeTimer,
        workTimer: state.workTimer,
        history: state.history,
        sortDirection: state.sortDirection,
      }),
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name)
            return value ? JSON.parse(value) : null
          } catch (error) {
            console.error("Error retrieving from localStorage:", error)
            return null
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.error("Error storing in localStorage:", error)
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.error("Error removing from localStorage:", error)
          }
        },
      },
    },
  ),
)
