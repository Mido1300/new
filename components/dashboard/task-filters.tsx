"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DateRangeDialog } from "@/components/tasks/date-range-dialog"
import { Undo2, Redo2, ArrowUpDown, ArrowDownUp } from "lucide-react"
import { Input } from "@/components/ui/input"

export function TaskFilters() {
  const [dateRangeOpen, setDateRangeOpen] = useState(false)

  const { filters, setFilter, clearFilters, sort, setSort, undo, redo, history } = useAppStore()

  // Fix the sort direction toggle function to apply to all tasks
  const toggleSortDirection = () => {
    if (sort.by === "none") {
      // If no sort is selected, don't toggle direction
      return
    }
    const newDirection = sort.direction === "asc" ? "desc" : "asc"
    setSort(sort.by, newDirection)
  }

  // Update the handleDateFilterChange function to apply to all tasks
  const handleDateFilterChange = (value: string) => {
    if (value === "custom") {
      setDateRangeOpen(true)
    } else if (value === "all") {
      setFilter("dateRange", { start: null, end: null })
    } else if (value === "today") {
      const today = new Date().toISOString().split("T")[0]
      setFilter("dateRange", { start: today, end: today })
    } else if (value === "week") {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(today)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      setFilter("dateRange", {
        start: startOfWeek.toISOString().split("T")[0],
        end: endOfWeek.toISOString().split("T")[0],
      })
    } else if (value === "month") {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      setFilter("dateRange", {
        start: startOfMonth.toISOString().split("T")[0],
        end: endOfMonth.toISOString().split("T")[0],
      })
    }
  }

  // Improve the sort function to ensure it applies to all tasks
  const handleSortChange = (value: string) => {
    // Apply the sort to all tasks
    setSort(value as "dueDate" | "priority" | "title" | "created" | "none")
  }

  return (
    <>
      <Card className="mb-6 animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filters.category} onValueChange={(value) => setFilter("category", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilter("priority", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilter("status", value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={history.position < 0}
                className={history.position < 0 ? "opacity-50" : ""}
                title="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={history.position >= history.actions.length - 1}
                className={history.position >= history.actions.length - 1 ? "opacity-50" : ""}
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Options and Search */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Sort By:</span>
          <Select value={sort.by} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="No Sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Sorting</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
            </SelectContent>
          </Select>
          {/* Update the sort direction indicator to be more clear */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSortDirection}
            className="ml-2"
            disabled={sort.by === "none"}
          >
            {sort.direction === "asc" ? (
              <ArrowUpDown className="h-4 w-4" title="Ascending" />
            ) : (
              <ArrowDownUp className="h-4 w-4" title="Descending" />
            )}
          </Button>
        </div>
      </div>

      <DateRangeDialog open={dateRangeOpen} onOpenChange={setDateRangeOpen} />
    </>
  )
}
