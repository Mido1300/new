import { TaskStats } from "@/components/dashboard/task-stats"
import { TaskControls } from "@/components/dashboard/task-controls"
import { TaskFilters } from "@/components/dashboard/task-filters"
import { TaskList } from "@/components/dashboard/task-list"
import { TaskCharts } from "@/components/dashboard/task-charts"
import { Insights } from "@/components/dashboard/insights"

export default function Dashboard() {
  return (
    <main className="container mx-auto p-4">
      <TaskStats />
      <TaskControls />
      <TaskFilters />
      <TaskList />
      <TaskCharts />
      <Insights />
    </main>
  )
}
