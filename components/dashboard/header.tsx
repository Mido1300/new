"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppStore } from "@/lib/store"
import { useAuth } from "@/lib/hooks/use-auth"
import type { UserStatus } from "@/types"
import { formatTime } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"
import { UserProfile } from "@/components/profile/user-profile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Clock, LogOut, User, CheckCircle2 } from "lucide-react"

export function Header() {
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const {
    notifications,
    markAllNotificationsAsRead,
    status,
    setStatus,
    workTimer,
    startWorkTimer,
    pauseWorkTimer,
    stopWorkTimer,
  } = useAppStore()

  const [timeDisplay, setTimeDisplay] = useState("00:00:00")
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Status color mapping
  const statusColors: Record<UserStatus, string> = {
    online: "border-green-500",
    break: "border-yellow-500",
    shadow: "border-gray-500",
    offline: "border-red-500",
  }

  // Update timer display
  useEffect(() => {
    if (!workTimer.startTime && workTimer.elapsed === 0) {
      setTimeDisplay("00:00:00")
      return
    }

    const updateDisplay = () => {
      let elapsed = workTimer.elapsed

      if (workTimer.startTime) {
        const now = new Date()
        elapsed += now.getTime() - workTimer.startTime.getTime()
      }

      setTimeDisplay(formatTime(elapsed))
    }

    // Set up interval to update the timer display
    if (workTimer.startTime && !timerInterval) {
      const interval = setInterval(updateDisplay, 1000)
      setTimerInterval(interval)
      updateDisplay()
    } else if (!workTimer.startTime && timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
      updateDisplay()
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [workTimer, timerInterval])

  // Handle status change
  const handleStatusChange = (newStatus: UserStatus) => {
    setStatus(newStatus)
  }

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-3 sm:p-4 sticky top-0 z-10">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-primary text-white rounded-full p-1.5 sm:p-2 mr-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-primary">TaskMaster</h1>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Time Counter */}
          {status !== "offline" && (
            <div
              className={`hidden md:flex items-center px-3 py-1 rounded-full border-2 text-sm ${statusColors[status]}`}
            >
              <Clock className="h-4 w-4 mr-2" />
              <span>{timeDisplay}</span>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 sm:w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => markAllNotificationsAsRead()}
                    >
                      <div className="font-semibold text-sm sm:text-base">{notification.title}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{notification.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground">No notifications</div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none">
                <Image
                  src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                  width={28}
                  height={28}
                  className={`rounded-full border-2 ${statusColors[status]} sm:w-8 sm:h-8`}
                  alt="User avatar"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 sm:w-auto">
              <div className="p-3 border-b">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{user?.role}</div>
              </div>

              {/* Status Options */}
              <div className="p-2 border-b">
                <div className="mb-2 text-xs sm:text-sm font-medium">Status</div>
                <div className="space-y-1">
                  <button
                    className={`w-full text-left px-2 py-1 text-xs sm:text-sm rounded ${
                      status === "online" ? "bg-secondary" : "hover:bg-accent"
                    }`}
                    onClick={() => handleStatusChange("online")}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                    Online
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs sm:text-sm rounded ${
                      status === "break" ? "bg-secondary" : "hover:bg-accent"
                    }`}
                    onClick={() => handleStatusChange("break")}
                  >
                    <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block mr-2"></span>
                    On Break
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs sm:text-sm rounded ${
                      status === "shadow" ? "bg-secondary" : "hover:bg-accent"
                    }`}
                    onClick={() => handleStatusChange("shadow")}
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-500 inline-block mr-2"></span>
                    Shadow
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs sm:text-sm rounded ${
                      status === "offline" ? "bg-secondary" : "hover:bg-accent"
                    }`}
                    onClick={() => handleStatusChange("offline")}
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block mr-2"></span>
                    Offline
                  </button>
                </div>
              </div>

              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Edit Profile</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Profile Dialog */}
      <UserProfile open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  )
}
