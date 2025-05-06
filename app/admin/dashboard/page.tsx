"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminHeader from "@/components/admin/admin-header"
import UserManagement from "@/components/admin/user-management"
import DeviceManagement from "@/components/admin/device-management"
import AccessControl from "@/components/admin/access-control"
import BillingManagement from "@/components/admin/billing-management"

// Sample data for demonstration
const initialUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    company: "Acme Corp",
    phone: "555-123-4567",
    notificationEmails: "john@example.com,manager@acme.com",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    company: "TechSolutions",
    phone: "555-987-6543",
    notificationEmails: "jane@example.com",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "User",
    company: "Innovate Inc",
    phone: "555-456-7890",
    notificationEmails: "robert@example.com,admin@innovate.com",
  },
]

const initialDevices = [
  {
    id: "DEV001",
    name: "Temperature Sensor",
    location: "Living Room",
    status: "Online",
    configuration: { reportInterval: 5, threshold: 30 },
    billing: { type: "Rental", paymentStatus: "Current", lastPayment: "2023-04-15" },
  },
  {
    id: "DEV002",
    name: "Smart Lock",
    location: "Front Door",
    status: "Online",
    configuration: { autoLock: true, pinRequired: true },
    billing: { type: "Purchase", paymentStatus: "Current", lastPayment: "2023-03-10" },
  },
  {
    id: "DEV003",
    name: "Security Camera",
    location: "Backyard",
    status: "Offline",
    configuration: { resolution: "1080p", motionDetection: true },
    billing: { type: "Rental", paymentStatus: "Overdue", lastPayment: "2023-01-20" },
  },
  {
    id: "DEV004",
    name: "Humidity Sensor",
    location: "Bathroom",
    status: "Online",
    configuration: { reportInterval: 10, threshold: 70 },
    billing: { type: "Rental", paymentStatus: "Current", lastPayment: "2023-04-01" },
  },
]

const initialAccessRights = [
  { userId: 1, deviceId: "DEV001", granted: true },
  { userId: 1, deviceId: "DEV002", granted: true },
  { userId: 2, deviceId: "DEV002", granted: true },
  { userId: 2, deviceId: "DEV003", granted: true },
  { userId: 3, deviceId: "DEV001", granted: true },
  { userId: 3, deviceId: "DEV004", granted: true },
]

export default function AdminDashboard() {
  const [users, setUsers] = useState(initialUsers)
  const [devices, setDevices] = useState(initialDevices)
  const [accessRights, setAccessRights] = useState(initialAccessRights)
  const [blockedDevices, setBlockedDevices] = useState<string[]>([])

  const handleAddUser = (user: any) => {
    const newUser = {
      id: users.length + 1,
      ...user,
    }
    setUsers([...users, newUser])
  }

  const handleAddDevice = (device: any) => {
    const newDevice = {
      id: device.id || `DEV${String(devices.length + 1).padStart(3, "0")}`,
      ...device,
      configuration: device.configuration || { reportInterval: 5, threshold: 30 },
      billing: device.billing || {
        type: "Rental",
        paymentStatus: "Current",
        lastPayment: new Date().toISOString().split("T")[0],
      },
    }
    setDevices([...devices, newDevice])
  }

  const handleToggleAccess = (userId: number, deviceId: string) => {
    const existingAccess = accessRights.find((access) => access.userId === userId && access.deviceId === deviceId)

    if (existingAccess) {
      // Toggle existing access
      setAccessRights(
        accessRights.map((access) =>
          access.userId === userId && access.deviceId === deviceId ? { ...access, granted: !access.granted } : access,
        ),
      )
    } else {
      // Add new access
      setAccessRights([...accessRights, { userId, deviceId, granted: true }])
    }
  }

  const handleUpdateDeviceConfig = (deviceId: string, config: any) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId ? { ...device, configuration: { ...device.configuration, ...config } } : device,
      ),
    )
  }

  const handleToggleDeviceBlock = (deviceId: string) => {
    if (blockedDevices.includes(deviceId)) {
      setBlockedDevices(blockedDevices.filter((id) => id !== deviceId))
    } else {
      setBlockedDevices([...blockedDevices, deviceId])
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="devices">Device Management</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement users={users} onAddUser={handleAddUser} />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <DeviceManagement
              devices={devices}
              onAddDevice={handleAddDevice}
              onUpdateDeviceConfig={handleUpdateDeviceConfig}
            />
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <AccessControl
              users={users}
              devices={devices}
              accessRights={accessRights}
              onToggleAccess={handleToggleAccess}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <BillingManagement
              devices={devices}
              users={users}
              accessRights={accessRights}
              blockedDevices={blockedDevices}
              onToggleDeviceBlock={handleToggleDeviceBlock}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
