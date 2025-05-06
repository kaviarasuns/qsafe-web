"use client"

import { Button } from "@/components/ui/button"
import { Shield, User, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserHeaderProps {
  userName: string
}

export default function UserHeader({ userName }: UserHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <header className="border-b dark:border-border">
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center">
          <Link href="/user/dashboard" className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-medium">IoT Access Manager</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline">{userName}</span>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
