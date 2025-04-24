"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { UserCard } from "./user-card"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserTasksList } from "./user-tasks-list"

interface UsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersDialog({ open, onOpenChange }: UsersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const { users, tasks } = useAppStore()

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  // Count assigned tasks for each user
  const getAssignedTasksCount = (userId: number) => {
    return tasks.filter((task) => task.assignedTo === userId).length
  }

  // Get tasks for selected user
  const selectedUserTasks = tasks.filter((task) => task.assignedTo === selectedUserId)
  const selectedUser = users.find((user) => user.id === selectedUserId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={selectedUserId ? "tasks" : "users"} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="users" onClick={() => setSelectedUserId(null)}>
              All Users
            </TabsTrigger>
            <TabsTrigger value="tasks" disabled={!selectedUserId}>
              {selectedUser ? `${selectedUser.name}'s Tasks` : "User Tasks"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    tasksCount={getAssignedTasksCount(user.id)}
                    onClick={() => {
                      setSelectedUserId(user.id)
                      document
                        .querySelector('[data-value="tasks"]')
                        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No users found matching your search criteria.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            {selectedUserId && (
              <UserTasksList
                userId={selectedUserId}
                onBack={() => {
                  document
                    .querySelector('[data-value="users"]')
                    ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
