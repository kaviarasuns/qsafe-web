"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import type { AdminRole } from "@/contexts/admin-context"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // In a real app, you would validate credentials against your backend
    // For this UI demo, we'll simulate login based on username
    let role: AdminRole = null
    let userName = ""

    switch (username.toLowerCase()) {
      case "super":
      case "superadmin":
        role = "super_admin"
        userName = "Super Admin"
        break
      case "billing":
        role = "billing_admin"
        userName = "Billing Admin"
        break
      case "inventory":
        role = "inventory_admin"
        userName = "Inventory Admin"
        break
      case "calibration":
      case "lab":
        role = "calibration_lab_admin"
        userName = "Calibration Lab Admin"
        break
      case "qsafe":
        role = "qsafe_admin"
        userName = "QSafe Admin"
        break
      case "user":
        // Regular user
        role = null
        userName = "Regular User"
        break
      default:
        if (username) {
          // Any other username is treated as a regular user
          role = null
          userName = username
        } else {
          setError("Please enter a username")
          return
        }
    }

    // Store role and username in localStorage
    if (role) {
      localStorage.setItem("adminRole", role)
    } else {
      localStorage.removeItem("adminRole")
    }

    localStorage.setItem("userName", userName)

    // Redirect to appropriate dashboard
    if (role) {
      router.push("/admin/dashboard")
    } else {
      router.push("/user/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 dark:bg-muted/10 p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-primary">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <span className="font-medium">IoT Access Manager</span>
        </Link>
      </div>

      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        <p>For demo purposes:</p>
        <p>Login as &quot;super&quot; for Super Admin access</p>
        <p>Login as &quot;billing&quot; for Billing Admin access</p>
        <p>Login as &quot;inventory&quot; for Inventory Admin access</p>
        <p>Login as &quot;calibration&quot; for Calibration Lab Admin access</p>
        <p>Login as &quot;qsafe&quot; for QSafe Admin access</p>
        <p>Login with any other username to see the user dashboard</p>
      </div>
    </div>
  )
}
