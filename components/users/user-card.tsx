"use client"

import Image from "next/image"
import type { User } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserCardProps {
  user: User
  tasksCount: number
  onClick?: () => void
}

export function UserCard({ user, tasksCount, onClick }: UserCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <Image
            src={user.avatar || "/placeholder.svg"}
            alt={`${user.name}'s avatar`}
            width={48}
            height={48}
            className="rounded-full object-cover mr-3"
          />
          <div className="flex-grow">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm flex items-center">
            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{user.email}</span>
          </p>
          <p className="text-sm flex items-center mt-1">
            <ListTodo className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{tasksCount} assigned tasks</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          View Tasks
        </Button>
      </CardContent>
    </Card>
  )
}
