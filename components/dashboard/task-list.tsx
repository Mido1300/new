"use client"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskItem } from "@/components/tasks/task-item"
import { TaskSelectionActions } from "@/components/tasks/task-selection-actions"
import { TaskTimer } from "@/components/tasks/task-timer"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { useToast } from "@/components/ui/use-toast"
import { GripVertical } from "lucide-react"

export function TaskList() {
  const { tasks, filters, sort, view, selectedTasks, activeTimer } = useAppStore()
  const { toast } = useToast()

  // Filter tasks - exclude the Database Migration task
  const filteredTasks = tasks
    .filter((task) => task.title !== "Database Migration") // Remove Database Migration task
    .filter((task) => {
      // Search filter - check both title and description
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

  // Only sort if there's a sort criteria
  const sortedTasks = sort.by === "created" ? filteredTasks : [...filteredTasks].sort((a, b) => {
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
      default:
        result = 0
    }

    // Apply sort direction
    return sort.direction === "asc" ? result : -result
  })

  // Handle drag end - improved to handle reordering correctly
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result

    // If there's no destination or the item was dropped in the same position, do nothing
    if (!destination || destination.index === source.index) {
      return
    }

    // Get the task IDs for source and destination
    const sourceTask = sortedTasks[source.index]
    const destinationTask = sortedTasks[destination.index]
    
    if (!sourceTask || !destinationTask) {
      return
    }

    const sourceTaskId = sourceTask.id
    const destinationTaskId = destinationTask.id

    // Use the store's reorderTasks function
    useAppStore.getState().reorderTasks(sourceTaskId, destinationTaskId)

    // Show toast notification
    toast({
      title: "Task Reordered",
      description: "Task position has been updated",
      duration: 3000,
    })
  }

  if (view !== "list") return null

  return (
    <div className="mb-8">
      {selectedTasks.length > 0 && <TaskSelectionActions />}

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <CardTitle>Tasks ({sortedTasks.length})</CardTitle>
          <div className="text-sm text-muted-foreground">Drag and drop to reorder</div>
        </CardHeader>
        <CardContent className="p-0">
          {sortedTasks.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks" type="task">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 space-y-2">
                    {sortedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging ? provided.draggableProps.style?.transform : "none",
                            }}
                            className={`
                              rounded-md 
                              ${snapshot.isDragging ? "opacity-70 shadow-lg ring-2 ring-primary z-50" : ""}
                              transition-all duration-200
                            `}
                          >
                            <div className="flex items-center bg-card">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-2 sm:p-3 hover:bg-accent rounded-l-md flex items-center justify-center h-full"
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <TaskItem task={task} />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No tasks found. Try adjusting your filters or add a new task.
            </div>
          )}
        </CardContent>
      </Card>

      {activeTimer.taskId && <TaskTimer />}
    </div>
  )
}
