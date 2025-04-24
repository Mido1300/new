"use client"

import type React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
}) {
  const [mounted, setMounted] = useState(false)

  // Ensure hydration completes before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
