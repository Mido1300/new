"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileJson, FileIcon as FilePdf, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAppStore } from "@/lib/store"

interface ExportTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportTasksDialog({ open, onOpenChange }: ExportTasksDialogProps) {
  const [format, setFormat] = useState<"json" | "pdf" | "csv">("json")
  const [exportType, setExportType] = useState<"all" | "completed" | "pending">("all")
  const { tasks } = useAppStore()
  const { toast } = useToast()

  const handleExport = () => {
    // Filter tasks based on export type
    let tasksToExport = [...tasks]

    if (exportType === "completed") {
      tasksToExport = tasksToExport.filter((task) => task.completed)
    } else if (exportType === "pending") {
      tasksToExport = tasksToExport.filter((task) => !task.completed)
    }

    // Format data based on selected format
    let data: string
    let fileName: string
    let mimeType: string

    switch (format) {
      case "json":
        data = JSON.stringify(tasksToExport, null, 2)
        fileName = `taskmaster-export-${new Date().toISOString().split("T")[0]}.json`
        mimeType = "application/json"
        break
      case "csv":
        // Convert tasks to CSV format
        const headers = [
          "id",
          "title",
          "description",
          "category",
          "priority",
          "dueDate",
          "completed",
          "assignedTo",
          "notes",
          "created",
          "timer",
        ]
        const csvRows = [
          headers.join(","), // Header row
          ...tasksToExport.map((task) => {
            return headers
              .map((header) => {
                const value = task[header as keyof typeof task]
                // Handle arrays (like subtasks) and escape commas
                if (Array.isArray(value)) {
                  return `"${value.join(";")}"`
                }
                // Handle strings with commas
                if (typeof value === "string" && value.includes(",")) {
                  return `"${value}"`
                }
                return value
              })
              .join(",")
          }),
        ]
        data = csvRows.join("\n")
        fileName = `taskmaster-export-${new Date().toISOString().split("T")[0]}.csv`
        mimeType = "text/csv"
        break
      case "pdf":
        // For PDF, we'll create a simple HTML representation that will be converted to PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>TaskMaster Export</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .completed { background-color: #e8f5e9; }
          </style>
        </head>
        <body>
          <h1>TaskMaster Export</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tasksToExport
                .map(
                  (task) => `
                <tr class="${task.completed ? "completed" : ""}">
                  <td>${task.title}</td>
                  <td>${task.category || ""}</td>
                  <td>${task.priority || ""}</td>
                  <td>${task.dueDate || ""}</td>
                  <td>${task.completed ? "Completed" : "Pending"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `
        data = htmlContent
        fileName = `taskmaster-export-${new Date().toISOString().split("T")[0]}.html`
        mimeType = "text/html"
        break
    }

    // Create a blob and download the file
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Show toast notification
    toast({
      title: "Tasks Exported",
      description: `Tasks exported as ${format.toUpperCase()}`,
    })

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              defaultValue="json"
              value={format}
              onValueChange={(value) => setFormat(value as "json" | "pdf" | "csv")}
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="format-json"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="json" id="format-json" className="sr-only" />
                <FileJson className="mb-3 h-6 w-6 text-primary" />
                <span className="text-center">JSON</span>
              </Label>
              <Label
                htmlFor="format-pdf"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="pdf" id="format-pdf" className="sr-only" />
                <FilePdf className="mb-3 h-6 w-6 text-red-500" />
                <span className="text-center">HTML/PDF</span>
              </Label>
              <Label
                htmlFor="format-csv"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="csv" id="format-csv" className="sr-only" />
                <FileText className="mb-3 h-6 w-6 text-blue-500" />
                <span className="text-center">CSV</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-tasks">Select Tasks</Label>
            <Select
              defaultValue="all"
              onValueChange={(value) => setExportType(value as "all" | "completed" | "pending")}
            >
              <SelectTrigger id="export-tasks">
                <SelectValue placeholder="Select tasks to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed Tasks Only</SelectItem>
                <SelectItem value="pending">Pending Tasks Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
