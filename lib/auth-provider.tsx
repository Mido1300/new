"use client"

import { useContext } from "react"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"
import { useAppStore } from "./store"

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: Omit<User, "id" | "avatar">) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
  updateUserProfile: (userData: User) => Promise<{ success: boolean; message?: string }>
  hasPermission: (user: User | null, requiredRole: string) => boolean
}

// Make sure the AuthContext is properly exported
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const { currentUser, users, setCurrentUser, updateUser, setStatus } = useAppStore()

  // Update the useEffect hook to check for existing session and add default admin credentials
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first
        const storedUser = localStorage.getItem("taskmaster-user")

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            const user = users.find((u) => u.id === userData.id)
            if (user) {
              setCurrentUser(user)
              // Set status to offline by default
              setStatus("offline")
            }
          } catch (e) {
            console.error("Failed to parse stored user:", e)
            // Clear invalid data
            localStorage.removeItem("taskmaster-user")
          }
        } else {
          // Fallback to cookie check
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth-token="))
            ?.split("=")[1]

          if (token) {
            // Decode the token to get the user ID
            try {
              const userId = Number.parseInt(atob(token))

              // Find the user
              const user = users.find((u) => u.id === userId)
              if (user) {
                setCurrentUser(user)
                // Set status to offline by default
                setStatus("offline")

                // Store in localStorage for future use
                localStorage.setItem("taskmaster-user", JSON.stringify({ id: user.id }))
              }
            } catch (error) {
              console.error("Failed to decode token:", error)
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [users, setCurrentUser, setStatus])

  // Update the login function to handle the default admin credentials
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Find user with matching email and password
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        // Set current user
        setCurrentUser(user)

        // Set status to offline by default
        setStatus("offline")

        // Create a simple token (base64 encoded user ID)
        const token = btoa(user.id.toString())

        // Set cookie (expires in 7 days)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 7)
        document.cookie = `auth-token=${token}; expires=${expiryDate.toUTCString()}; path=/`

        // Store in localStorage for future use
        localStorage.setItem("taskmaster-user", JSON.stringify({ id: user.id }))

        return { success: true }
      } else {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Omit<User, "id" | "avatar">) => {
    setIsLoading(true)

    try {
      // Check if email already exists
      const existingUser = users.find((u) => u.email === userData.email)
      if (existingUser) {
        return {
          success: false,
          message: "Email already in use",
        }
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        avatar: `https://i.imgur.com/8Km9tLL.jpg`, // Default avatar
      }

      // Add user to store
      updateUser(newUser)

      // Set as current user
      setCurrentUser(newUser)

      // Set status to offline by default
      setStatus("offline")

      // Create a simple token (base64 encoded user ID)
      const token = btoa(newUser.id.toString())

      // Set cookie (expires in 7 days)
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      document.cookie = `auth-token=${token}; expires=${expiryDate.toUTCString()}; path=/`

      // Store in localStorage for future use
      localStorage.setItem("taskmaster-user", JSON.stringify({ id: newUser.id }))

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear current user
    setCurrentUser(null)

    // Clear cookie
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // Clear localStorage
    localStorage.removeItem("taskmaster-user")

    // Redirect to login page
    router.push("/")
  }

  const updateUserProfile = async (userData: User) => {
    setIsLoading(true)

    try {
      // Update user in store
      updateUser(userData)

      // Update current user if it's the same user
      if (currentUser && currentUser.id === userData.id) {
        setCurrentUser(userData)
      }

      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Implement role-based restrictions
  const hasPermission = (user: User | null, requiredRole: string) => {
    if (!user) return false

    // Define role hierarchy
    const roles = ["Customer", "Staff", "Manager", "Admin"]

    // Get role indices
    const userRoleIndex = roles.indexOf(user.role)
    const requiredRoleIndex = roles.indexOf(requiredRole)

    // Check if user's role is high enough in the hierarchy
    return userRoleIndex >= requiredRoleIndex
  }

  // Add this to the context value
  const contextValue = {
    user: currentUser,
    login,
    register,
    logout,
    isLoading,
    updateUserProfile,
    hasPermission,
  }

  // At the end of the file, make sure the provider is properly exported
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
