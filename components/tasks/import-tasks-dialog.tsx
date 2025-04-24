"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileUp, X, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAppStore } from "@/lib/store"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportTasksDialog({ open, onOpenChange }: ImportTasksDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const { addTask } = useAppStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "json") {
        // Handle JSON import
        const reader = new FileReader()

        reader.onload = (event) => {
          try {
            const text = event.target?.result as string
            const tasks = JSON.parse(text)

            if (!Array.isArray(tasks)) {
              throw new Error("Invalid JSON format. Expected an array of tasks.")
            }

            // Validate tasks have required fields
            tasks.forEach((task, index) => {
              if (!task.title) {
                throw new Error(`Task at index ${index} is missing a title`)
              }
            })

            // Import tasks
            let importCount = 0
            tasks.forEach((task) => {
              // Generate a new ID for the task to avoid conflicts
              const taskToImport = {
                ...task,
                id: 0, // The store will assign a new ID
              }
              addTask(taskToImport)
              importCount++
            })

            toast({
              title: "Tasks Imported",
              description: `Successfully imported ${importCount} tasks from ${file.name}`,
            })

            // Reset form
            setFile(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }

            // Close dialog
            onOpenChange(false)
            setIsLoading(false)
          } catch (err) {
            console.error("Import error:", err)
            setError(err instanceof Error ? err.message : "Failed to import tasks. Please check the file format.")
            setIsLoading(false)
          }
        }

        reader.onerror = () => {
          setError("Failed to read the file. Please try again.")
          setIsLoading(false)
        }

        reader.readAsText(file)
      } else if (fileExtension === "csv") {
        // Handle CSV import
        const reader = new FileReader()

        reader.onload = (event) => {
          try {
            const text = event.target?.result as string
            const rows = text.split("\n")

            if (rows.length < 2) {
              throw new Error("CSV file must contain a header row and at least one data row")
            }

            // Parse header row
            const headers = rows[0].split(",").map((header) => header.trim())

            // Validate required headers
            if (!headers.includes("title")) {
              throw new Error("CSV file must contain a 'title' column")
            }

            // Parse data rows
            const tasks = rows
              .slice(1)
              .filter((row) => row.trim())
              .map((row) => {
                const values = row.split(",")
                const task: any = {}

                headers.forEach((header, index) => {
                  if (index < values.length) {
                    let value = values[index].trim()

                    // Handle quoted values (may contain commas)
                    if (value.startsWith('"') && value.endsWith('"')) {
                      value = value.substring(1, value.length - 1)
                    }

                    // Convert to appropriate types
                    if (header === "completed") {
                      task[header] = value.toLowerCase() === "true"
                    } else if (header === "assignedTo" || header === "id" || header === "timer") {
                      task[header] = Number.parseInt(value) || 0
                    } else if (header === "subtasks" && value) {
                      task[header] = value.split(";")
                    } else {
                      task[header] = value
                    }
                  }
                })

                return task
              })

            // Import tasks
            let importCount = 0
            tasks.forEach((task) => {
              if (task.title) {
                // Generate a new ID for the task to avoid conflicts
                const taskToImport = {
                  ...task,
                  id: 0, // The store will assign a new ID
                }
                addTask(taskToImport)
                importCount++
              }
            })

            toast({
              title: "Tasks Imported",
              description: `Successfully imported ${importCount} tasks from ${file.name}`,
            })

            // Reset form
            setFile(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }

            // Close dialog
            onOpenChange(false)
            setIsLoading(false)
          } catch (err) {
            console.error("Import error:", err)
            setError(err instanceof Error ? err.message : "Failed to import tasks. Please check the file format.")
            setIsLoading(false)
          }
        }

        reader.onerror = () => {
          setError("Failed to read the file. Please try again.")
          setIsLoading(false)
        }

        reader.readAsText(file)
      } else {
        throw new Error("Unsupported file format. Please use JSON or CSV files.")
      }
    } catch (err) {
      console.error("Import error:", err)
      setError(err instanceof Error ? err.message : "Failed to import tasks. Please check the file format.")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor="import-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">JSON or CSV files</p>
              </div>
              <input
                id="import-file"
                type="file"
                className="hidden"
                accept=".json,.csv"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Label>
          </div>

          {file && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center">
                <FileUp className="w-4 h-4 mr-2 text-primary" />
                <span>{file.name}</span>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={handleRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <div className="font-semibold mb-1">Supported formats:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>JSON: Array of task objects with title, description, etc.</li>
              <li>CSV: First row as headers, subsequent rows as task data</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
