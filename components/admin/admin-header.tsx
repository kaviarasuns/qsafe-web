"use client"

import { Button } from "@/components/ui/button"
import { Shield, User, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <header className="border-b bg-primary/5 dark:bg-primary/10">
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-medium">IoT Access Manager</span>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
