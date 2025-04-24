"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAppStore } from "./store"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

type KeyboardShortcutsContextType = {}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const { undo, redo, setView, view, selectedTasks, deleteMultipleTasks } = useAppStore()
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl + Z: Undo
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault()
        undo()
      }

      // Ctrl + Y: Redo
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault()
        redo()
      }

      // Ctrl + D: Toggle dark mode
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault()
        setTheme(theme === "dark" ? "light" : "dark")
      }

      // Alt + 1: Switch to list view
      if (e.altKey && e.key === "1") {
        e.preventDefault()
        setView("list")
      }

      // Alt + 2: Switch to graph view
      if (e.altKey && e.key === "2") {
        e.preventDefault()
        setView("graph")
      }

      // N: New task
      if (e.key === "n" && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        // This will be handled by the component that shows the add task dialog
        document.dispatchEvent(new CustomEvent("app:add-task"))
      }

      // Ctrl + F: Focus search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Delete: Delete selected tasks
      if (e.key === "Delete" && selectedTasks.length > 0) {
        e.preventDefault()
        deleteMultipleTasks(selectedTasks)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [undo, redo, setTheme, theme, setView, view, selectedTasks, deleteMultipleTasks, router])

  return <KeyboardShortcutsContext.Provider value={{}}>{children}</KeyboardShortcutsContext.Provider>
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (context === undefined) {
    throw new Error("useKeyboardShortcuts must be used within a KeyboardShortcutsProvider")
  }
  return context
}
