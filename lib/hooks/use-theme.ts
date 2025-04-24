// Create a custom hook for theme
"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get current theme with fallback
  const currentTheme = mounted ? theme : "light"

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
    mounted,
  }
}
