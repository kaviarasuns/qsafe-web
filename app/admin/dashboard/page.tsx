"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminHeader from "@/components/admin/admin-header"
import UserManagement from "@/components/admin/user-management"
import DeviceManagement from "@/components/admin/device-management"
import AccessControl from "@/components/admin/access-control"
import BillingManagement from "@/components/admin/billing-management"
import { useAdmin } from "@/contexts/admin-context"
import { AdminProvider } from "@/contexts/admin-context"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldAlert } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"
import RoleManagement from "@/components/admin/role-management"
import CalibrationReminder from "@/components/admin/calibration-remider"
import ServiceReminderComponent from "@/components/admin/service.remider"

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
    adminType: null,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    company: "TechSolutions",
    phone: "555-987-6543",
    notificationEmails: "jane@example.com",
    adminType: null,
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "User",
    company: "Innovate Inc",
    phone: "555-456-7890",
    notificationEmails: "robert@example.com,admin@innovate.com",
    adminType: null,
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    company: "System Admin",
    phone: "555-111-2222",
    notificationEmails: "admin@example.com",
    adminType: "full",
  },
  {
    id: 5,
    name: "Billing Admin",
    email: "billing@example.com",
    role: "Admin",
    company: "Finance Dept",
    phone: "555-333-4444",
    notificationEmails: "billing@example.com",
    adminType: "billing",
  },
]

const today = new Date()

// Define Device type to match the required interface
interface DeviceConfiguration {
  [key: string]: any;
  vibration?: boolean;
  lutronNoise?: boolean;
  values?: number;
}

interface Device {
  id: string;
  name: string;
  location: string;
  status: string;
  configuration: DeviceConfiguration;
  calibrationDueDate?: string;
  deviceType: "Sales" | "Rental";
  installedDate: string;
  lastCalibrationDate?: string;
  model?: string;
  serialNumber?: string;
  billing?: {
    type: string;
    paymentStatus: string;
    lastPayment: string;
  };
}

const initialDevices: Device[] = [
  {
    id: "DEV001",
    name: "Temperature Sensor",
    location: "Living Room",
    status: "Online",
    deviceType: "Rental",
    installedDate: format(subMonths(today, 3), "yyyy-MM-dd"),
    calibrationDueDate: format(addMonths(today, 3), "yyyy-MM-dd"),
    lastCalibrationDate: format(subMonths(today, 9), "yyyy-MM-dd"),
    model: "TS-2000",
    serialNumber: "TS2000-12345",
    configuration: {
      reportInterval: 5,
      threshold: 30,
      vibration: true,
      lutronNoise: false,
      values: 25,
    },
    billing: { type: "Rental", paymentStatus: "Current", lastPayment: format(subMonths(today, 1), "yyyy-MM-dd") },
  },
  {
    id: "DEV002",
    name: "Smart Lock",
    location: "Front Door",
    status: "Online",
    deviceType: "Sales",
    installedDate: format(subMonths(today, 6), "yyyy-MM-dd"),
    calibrationDueDate: format(addMonths(today, 6), "yyyy-MM-dd"),
    configuration: {
      autoLock: true,
      pinRequired: true,
      vibration: false,
      lutronNoise: true,
      values: 10,
    },
    billing: { type: "Purchase", paymentStatus: "Current", lastPayment: format(subMonths(today, 6), "yyyy-MM-dd") },
  },
  {
    id: "DEV003",
    name: "Security Camera",
    location: "Backyard",
    status: "Offline",
    deviceType: "Rental",
    installedDate: format(subMonths(today, 2), "yyyy-MM-dd"),
    calibrationDueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    configuration: {
      resolution: "1080p",
      motionDetection: true,
      vibration: true,
      lutronNoise: true,
      values: 50,
    },
    billing: { type: "Rental", paymentStatus: "Overdue", lastPayment: format(subMonths(today, 3), "yyyy-MM-dd") },
  },
  {
    id: "DEV004",
    name: "Humidity Sensor",
    location: "Bathroom",
    status: "Online",
    deviceType: "Sales",
    installedDate: format(subMonths(today, 1), "yyyy-MM-dd"),
    calibrationDueDate: format(addMonths(today, 5), "yyyy-MM-dd"),
    configuration: {
      reportInterval: 10,
      threshold: 70,
      vibration: false,
      lutronNoise: false,
      values: 15,
    },
    billing: { type: "Rental", paymentStatus: "Current", lastPayment: format(subMonths(today, 1), "yyyy-MM-dd") },
  },
]

interface AccessRight {
  userId: number;
  deviceId: string;
  granted: boolean;
  assignedDate?: string;
  dueDate?: string;
  deviceType?: "Sales" | "Rental";
}

const initialAccessRights: AccessRight[] = [
  {
    userId: 1,
    deviceId: "DEV001",
    granted: true,
    assignedDate: format(subMonths(today, 3), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Rental",
  },
  {
    userId: 1,
    deviceId: "DEV002",
    granted: true,
    assignedDate: format(subMonths(today, 6), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Sales",
  },
  {
    userId: 2,
    deviceId: "DEV002",
    granted: true,
    assignedDate: format(subMonths(today, 6), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Sales",
  },
  {
    userId: 2,
    deviceId: "DEV003",
    granted: true,
    assignedDate: format(subMonths(today, 2), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Rental",
  },
  {
    userId: 3,
    deviceId: "DEV001",
    granted: true,
    assignedDate: format(subMonths(today, 3), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Rental",
  },
  {
    userId: 3,
    deviceId: "DEV004",
    granted: true,
    assignedDate: format(subMonths(today, 1), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    deviceType: "Sales",
  },
]

const initialServiceReminders = [
  {
    id: "SVC001",
    userId: 1,
    serviceType: "Annual Maintenance",
    siteLocation: "Main Office",
    lastServiceDate: format(subMonths(today, 10), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 2), "yyyy-MM-dd"),
    reminderEnabled: true,
    reminderMonths: 12,
  },
  {
    id: "SVC002",
    userId: 2,
    serviceType: "Quarterly Inspection",
    siteLocation: "Warehouse",
    lastServiceDate: format(subMonths(today, 2), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    reminderEnabled: true,
    reminderMonths: 3,
  },
  {
    id: "SVC003",
    userId: 3,
    serviceType: "Filter Replacement",
    siteLocation: "Production Floor",
    lastServiceDate: format(subMonths(today, 6), "yyyy-MM-dd"),
    dueDate: format(subMonths(today, 0), "yyyy-MM-dd"),
    reminderEnabled: false,
    reminderMonths: 6,
  },
  {
    id: "SVC004",
    userId: 1,
    serviceType: "Calibration",
    siteLocation: "Lab Room",
    lastServiceDate: format(subMonths(today, 11), "yyyy-MM-dd"),
    dueDate: format(addMonths(today, 1), "yyyy-MM-dd"),
    reminderEnabled: true,
    reminderMonths: 12,
  },
]

function AdminDashboardContent() {
  const [users, setUsers] = useState(initialUsers)
  const [devices, setDevices] = useState(initialDevices)
  const [accessRights, setAccessRights] = useState(initialAccessRights)
  const [blockedDevices, setBlockedDevices] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("")
  const { role, permissions, isLoading } = useAdmin()
  const router = useRouter()
  const [serviceReminders, setServiceReminders] = useState(initialServiceReminders)

  useEffect(() => {
    // Only redirect if we've finished loading and there's no role
    if (!isLoading && !role) {
      router.push("/login")
    }

    // Set default tab based on permissions
    if (!isLoading && role) {
      if (permissions.users) {
        setActiveTab("users")
      } else if (permissions.devices) {
        setActiveTab("devices")
      } else if (permissions.access) {
        setActiveTab("access")
      } else if (permissions.billing) {
        setActiveTab("billing")
      } else if (permissions.calibration) {
        setActiveTab("calibration")
      } else if (permissions.service) {
        setActiveTab("service")
      }
    }
  }, [role, permissions, router, isLoading])

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
      configuration: device.configuration || {
        reportInterval: 5,
        threshold: 30,
        vibration: false,
        lutronNoise: false,
        values: 0,
      },
      billing: device.billing || {
        type: "Rental",
        paymentStatus: "Current",
        lastPayment: format(new Date(), "yyyy-MM-dd"),
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
      const device = devices.find((d) => d.id === deviceId)
      setAccessRights([
        ...accessRights,
        {
          userId,
          deviceId,
          granted: true,
          assignedDate: format(new Date(), "yyyy-MM-dd"),
          dueDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
          deviceType: device?.deviceType as "Sales" | "Rental",
        },
      ])
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

  const handleUpdateUser = (userId: number, userData: any) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, ...userData } : user)))
  }

  const handleUpdateServiceReminder = (id: string, data: Partial<any>) => {
    setServiceReminders(serviceReminders.map((reminder) => (reminder.id === id ? { ...reminder, ...data } : reminder)))
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  // If not loading and no role, we'll be redirected in the useEffect
  if (!role) {
    return null
  }

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <Alert className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{formatRole(role)} Access</AlertTitle>
          <AlertDescription>
            You are logged in as {formatRole(role)}. Your access is limited to specific features based on your role.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {permissions.users && <TabsTrigger value="users">User Management</TabsTrigger>}
            {permissions.devices && <TabsTrigger value="devices">Device Management</TabsTrigger>}
            {permissions.access && <TabsTrigger value="access">Access Control</TabsTrigger>}
            {permissions.billing && <TabsTrigger value="billing">Billing</TabsTrigger>}
            {permissions.calibration && <TabsTrigger value="calibration">Calibration Reminder</TabsTrigger>}
            {permissions.service && <TabsTrigger value="service">Service Reminder</TabsTrigger>}
            {permissions.users && role === "super_admin" && <TabsTrigger value="roles">Role Management</TabsTrigger>}
          </TabsList>

          {permissions.users && (
            <TabsContent value="users" className="space-y-4">
              <UserManagement users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} />
            </TabsContent>
          )}          {permissions.devices && (
            <TabsContent value="devices" className="space-y-4">
              <DeviceManagement
                devices={devices}
                onAddDevice={handleAddDevice}
                onUpdateDeviceConfig={handleUpdateDeviceConfig}
              />
            </TabsContent>
          )}

          {permissions.access && (
            <TabsContent value="access" className="space-y-4">
              <AccessControl
                users={users}
                devices={devices}
                accessRights={accessRights}
                onToggleAccess={handleToggleAccess}
              />
            </TabsContent>
          )}

          {permissions.billing && (
            <TabsContent value="billing" className="space-y-4">
              <BillingManagement
                devices={devices}
                users={users}
                accessRights={accessRights}
                blockedDevices={blockedDevices}
                onToggleDeviceBlock={handleToggleDeviceBlock}
              />
            </TabsContent>
          )}

          {permissions.calibration && (
            <TabsContent value="calibration" className="space-y-4">
              <CalibrationReminder devices={devices} users={users} accessRights={accessRights} />
            </TabsContent>
          )}

          {permissions.service && (
            <TabsContent value="service" className="space-y-4">
              <ServiceReminderComponent
                users={users}
                serviceReminders={serviceReminders}
                onUpdateReminder={handleUpdateServiceReminder}
              />
            </TabsContent>
          )}
          {permissions.users && role === "super_admin" && (
            <TabsContent value="roles" className="space-y-4">
              <RoleManagement
                users={users.map((user) => ({
                  ...user,
                  adminRole:
                    user.adminType === "full" ? "super_admin" : user.adminType === "billing" ? "billing_admin" : null,
                }))}
                onUpdateUserRole={(userId, role) => {
                  handleUpdateUser(userId, {
                    adminType: role === "super_admin" ? "full" : role === "billing_admin" ? "billing" : null,
                  })
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  )
}
