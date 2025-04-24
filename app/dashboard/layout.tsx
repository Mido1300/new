import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is logged in
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth-token")

  if (!authCookie) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
    </div>
  )
}
