"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/lib/hooks/use-auth"
import { useAppStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Loader2 } from "lucide-react"
import type { UserStatus } from "@/types"

interface UserProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  const { user, updateUserProfile } = useAuth()
  const { status, setStatus } = useAppStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      country: user?.country || "",
      bio: "",
    },
  })

  // Initialize form with user data when opened
  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        bio: user.bio || "",
      })
      setAvatarUrl(user.avatar || "")
    }
  }, [open, user, reset])

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return

    setIsLoading(true)

    try {
      // In a real app, we would upload the avatar and get a URL
      // For this demo, we'll just use the existing avatar or a placeholder

      // Update user profile
      await updateUserProfile({
        ...user,
        ...data,
        avatar: avatarUrl || user.avatar,
      })

      // Show success toast
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        duration: 5000,
      })

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle status change
  const handleStatusChange = (newStatus: UserStatus) => {
    setStatus(newStatus)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => {
                  // In a real app, we would open a file picker
                  // For this demo, we'll just use a placeholder
                  const placeholders = [
                    "https://i.imgur.com/8Km9tLL.jpg",
                    "https://i.imgur.com/3tVgsra.jpg",
                    "https://i.imgur.com/iNKlGdX.jpg",
                    "https://i.imgur.com/Q9HLmAo.jpg",
                    "https://i.imgur.com/LFQPmcB.jpg",
                  ]
                  const randomAvatar = placeholders[Math.floor(Math.random() * placeholders.length)]
                  setAvatarUrl(randomAvatar)
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Click the camera icon to change your avatar</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                type="button"
                variant={status === "online" ? "default" : "outline"}
                className={status === "online" ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => handleStatusChange("online")}
              >
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Online
              </Button>
              <Button
                type="button"
                variant={status === "break" ? "default" : "outline"}
                className={status === "break" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                onClick={() => handleStatusChange("break")}
              >
                <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                On Break
              </Button>
              <Button
                type="button"
                variant={status === "shadow" ? "default" : "outline"}
                className={status === "shadow" ? "bg-gray-500 hover:bg-gray-600" : ""}
                onClick={() => handleStatusChange("shadow")}
              >
                <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                Shadow
              </Button>
              <Button
                type="button"
                variant={status === "offline" ? "default" : "outline"}
                className={status === "offline" ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => handleStatusChange("offline")}
              >
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                Offline
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} aria-invalid={errors.name ? "true" : "false"} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                disabled
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select defaultValue={user?.country || ""} onValueChange={(value) => setValue("country", value)}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself" {...register("bio")} rows={4} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
