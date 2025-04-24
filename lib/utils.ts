import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the formatTime function to the utils.ts file
export function formatTime(milliseconds: number): string {
  // Handle negative or invalid values
  if (!milliseconds || milliseconds < 0) {
    return "00:00:00"
  }

  // Convert milliseconds to seconds, minutes, and hours
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // Format as HH:MM:SS
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":")
}

// Add the formatDate function as well, since it might be used
export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return ""

  // Format as Month Day, Year (e.g., "January 1, 2023")
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
