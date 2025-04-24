"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ShareTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: number
}

export function ShareTaskDialog({ open, onOpenChange, taskId }: ShareTaskDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [permission, setPermission] = useState<"view" | "edit">("view")

  const { users, tasks, addNotification } = useAppStore()
  const { toast } = useToast()

  // Get task
  const task = tasks.find((t) => t.id === taskId)

  // Handle add email
  const handleAddEmail = () => {
    if (emailInput.trim() && isValidEmail(emailInput.trim()) && !emails.includes(emailInput.trim())) {
      setEmails([...emails, emailInput.trim()])
      setEmailInput("")
    }
  }

  // Handle remove email
  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email))
  }

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle share
  const handleShare = () => {
    if (!task) return

    // Create detailed sharing message
    const userNames = selectedUsers.map(userId => {
      const user = users.find(u => u.id.toString() === userId)
      return user?.name || 'Unknown User'
    })
    
    const allRecipients = [...userNames, ...emails]
    const recipientCount = allRecipients.length
    
    // Create detailed notification message
    let notificationMessage = `"${task.title}" has been shared with:`
    
    if (userNames.length > 0) {
      notificationMessage += `\n• Team members: ${userNames.join(', ')}`
    }
    
    if (emails.length > 0) {
      notificationMessage += `\n• External users: ${emails.join(', ')}`
    }
    
    notificationMessage += `\n\nPermission level: ${permission === 'view' ? 'View Only' : 'Can Edit'}`

    // Add notification
    addNotification({
      title: "Task Shared",
      message: notificationMessage,
    })

    // Show toast with different messages based on recipient count
    if (recipientCount === 1) {
      toast({
        title: "Task Shared",
        description: `Task "${task.title}" has been shared with ${allRecipients[0]}`,
        duration: 5000,
        className: "fixed bottom-4 right-4",
      })
    } else {
      toast({
        title: "Task Shared",
        description: `Task "${task.title}" has been shared with ${recipientCount} recipients`,
        duration: 5000,
        className: "fixed bottom-4 right-4",
      })
    }

    // Reset form
    setSelectedUsers([])
    setEmails([])
    setEmailInput("")
    setPermission("view")

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">Share this task with team members or external collaborators</p>

          <div className="space-y-2">
            <Label htmlFor="share-users">Team Members</Label>
            <Select onValueChange={(value) => setSelectedUsers([...selectedUsers, value])}>
              <SelectTrigger id="share-users">
                <SelectValue placeholder="Select users" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((user) => !selectedUsers.includes(user.id.toString()))
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id.toString() === userId)
                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                      {user?.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setSelectedUsers(selectedUsers.filter((id) => id !== userId))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-email">Email</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-email"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddEmail()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {emails.map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permission</Label>
            <RadioGroup
              defaultValue="view"
              value={permission}
              onValueChange={(value) => setPermission(value as "view" | "edit")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id="view" />
                <Label htmlFor="view">View Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edit" id="edit" />
                <Label htmlFor="edit">Edit</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleShare} disabled={selectedUsers.length === 0 && emails.length === 0}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
