"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { AddTaskDialog } from "@/components/tasks/add-task-dialog"
import { DateRangeDialog } from "@/components/tasks/date-range-dialog"
import { CategoriesDialog } from "@/components/tasks/categories-dialog"
import { ImportTasksDialog } from "@/components/tasks/import-tasks-dialog"
import { ExportTasksDialog } from "@/components/tasks/export-tasks-dialog"
import { UsersDialog } from "@/components/users/users-dialog"
import { ViewSwitcher } from "./view-switcher"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import {
  Plus,
  ImportIcon as FileImport,
  FileOutputIcon as FileExport,
  Users,
  Tag,
  Calendar,
  Undo2,
  Redo2,
  Keyboard,
} from "lucide-react"

export function TaskControls() {
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const { setFilter, filters, undo, redo, history } = useAppStore()

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">{/* Search moved to filters section */}</div>
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <Button onClick={() => setAddTaskOpen(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>

          <Button variant="outline" size="icon" onClick={undo} disabled={history.position < 0} title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={history.position >= history.actions.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={() => setShortcutsOpen(true)} title="Keyboard Shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCategoriesOpen(true)}>
            <Tag className="h-4 w-4 mr-1" /> Categories
          </Button>

          <Button variant="outline" size="sm" onClick={() => setDateRangeOpen(true)}>
            <Calendar className="h-4 w-4 mr-1" /> Date Range
          </Button>

          <Button variant="outline" size="sm" onClick={() => setUsersOpen(true)}>
            <Users className="h-4 w-4 mr-1" /> Users
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
          <ViewSwitcher />

          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <FileImport className="h-4 w-4 mr-1" /> Import
          </Button>

          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <FileExport className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} />
      <DateRangeDialog open={dateRangeOpen} onOpenChange={setDateRangeOpen} />
      <CategoriesDialog open={categoriesOpen} onOpenChange={setCategoriesOpen} />
      <ImportTasksDialog open={importOpen} onOpenChange={setImportOpen} />
      <ExportTasksDialog open={exportOpen} onOpenChange={setExportOpen} />
      <UsersDialog open={usersOpen} onOpenChange={setUsersOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  )
}
