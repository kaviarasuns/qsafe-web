"use client"

import type React from "react"

import { useAdmin } from "@/contexts/admin-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UnauthorizedAccess from "./unauthorized-access"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission: keyof ReturnType<typeof useAdmin>['permissions']
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { permissions, isLoading } = useAdmin()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isLoading) {
      const hasPermission = permissions[requiredPermission as keyof typeof permissions]
      setIsAuthorized(hasPermission)
    }
  }, [isLoading, permissions, requiredPermission, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    )
  }

  if (isAuthorized === false) {
    return <UnauthorizedAccess />
  }

  return <>{children}</>
}
