import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { RegisterForm } from "@/components/auth/register-form"

export default function Register() {
  // Check if user is already logged in
  const cookieStore = cookies()
  const authCookie = cookieStore.get("auth-token")

  if (authCookie) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <RegisterForm />
    </main>
  )
}
