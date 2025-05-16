"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define all possible roles
export type AdminRole =
  | "super_admin"
  | "billing_admin"
  | "inventory_admin"
  | "calibration_lab_admin"
  | "qsafe_admin"
  | null

// Define permissions for each tab/feature
export interface Permissions {
  users: boolean
  devices: boolean
  access: boolean
  billing: boolean
  calibration: boolean
  service: boolean
}

interface AdminContextType {
  role: AdminRole
  setRole: (role: AdminRole) => void
  permissions: Permissions
  isLoading: boolean
  userName: string
  setUserName: (name: string) => void
}

// Define default permissions for each role
const rolePermissions: Record<string, Permissions> = {
  super_admin: {
    users: true,
    devices: true,
    access: true,
    billing: true,
    calibration: true,
    service: true,
  },
  billing_admin: {
    users: false,
    devices: false,
    access: false,
    billing: true,
    calibration: false,
    service: false,
  },
  inventory_admin: {
    users: true,
    devices: true,
    access: true,
    billing: false,
    calibration: false,
    service: false,
  },
  calibration_lab_admin: {
    users: false,
    devices: false,
    access: false,
    billing: false,
    calibration: true,
    service: false,
  },
  qsafe_admin: {
    users: false,
    devices: false,
    access: false,
    billing: false,
    calibration: false,
    service: true,
  },
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Load role from localStorage on client side
    const storedRole = localStorage.getItem("adminRole") as AdminRole
    if (storedRole) {
      setRole(storedRole)
    }

    // Load user name from localStorage
    const storedName = localStorage.getItem("userName")
    if (storedName) {
      setUserName(storedName)
    }

    setIsLoading(false)
  }, [])

  // Get permissions based on current role
  const permissions: Permissions = role
    ? rolePermissions[role]
    : {
        users: false,
        devices: false,
        access: false,
        billing: false,
        calibration: false,
        service: false,
      }

  return (
    <AdminContext.Provider value={{ role, setRole, permissions, isLoading, userName, setUserName }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
