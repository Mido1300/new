"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LayoutList, BarChart2 } from "lucide-react"

export function ViewSwitcher() {
  const { view, setView } = useAppStore()

  return (
    <div className="flex items-center bg-secondary rounded-lg p-1">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${view === "list" ? "" : "text-muted-foreground"}`}
        onClick={() => setView("list")}
      >
        <LayoutList className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>List</span>
      </Button>
      <Button
        variant={view === "graph" ? "default" : "ghost"}
        size="sm"
        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${view === "graph" ? "" : "text-muted-foreground"}`}
        onClick={() => setView("graph")}
      >
        <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Analytics</span>
      </Button>
    </div>
  )
}
