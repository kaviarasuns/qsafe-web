"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Bell, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { isBefore, addMonths } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface User {
  id: number
  name: string
  email: string
  role: string
  company?: string
  phone?: string
}

interface Device {
  id: string
  name: string
  location: string
  status: string
  deviceType: "Sales" | "Rental"
  installedDate: string
  calibrationDueDate?: string
  lastCalibrationDate?: string
  model?: string
  serialNumber?: string
}

interface AccessRight {
  userId: number
  deviceId: string
  granted: boolean
}

interface CalibrationReminderProps {
  devices: Device[]
  users: User[]
  accessRights: AccessRight[]
}

export default function CalibrationReminder({ devices, users, accessRights }: CalibrationReminderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const getUserForDevice = (deviceId: string) => {
    const userAccess = accessRights.find((access) => access.deviceId === deviceId && access.granted)
    if (!userAccess) return null

    return users.find((user) => user.id === userAccess.userId) || null
  }

  const getCompanyForUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    return user?.company || "N/A"
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  // Filter devices based on search term and active filters
  const filteredDevices = devices.filter((device) => {
    // Search filter
    const searchMatch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device.serialNumber && device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    // If no active filters, just use search
    if (activeFilters.length === 0) return searchMatch

    // Apply active filters
    const user = getUserForDevice(device.id)
    const isOverdue = device.calibrationDueDate && isBefore(new Date(device.calibrationDueDate), new Date())
    const isDueSoon =
      device.calibrationDueDate && !isOverdue && isBefore(new Date(device.calibrationDueDate), addMonths(new Date(), 1))

    return (
      searchMatch &&
      (activeFilters.includes("overdue") ? isOverdue : true) &&
      (activeFilters.includes("due-soon") ? isDueSoon : true) &&
      (activeFilters.includes("sales") ? device.deviceType === "Sales" : true) &&
      (activeFilters.includes("rental") ? device.deviceType === "Rental" : true)
    )
  })

  // Count devices by status
  const overdueCount = devices.filter(
    (device) => device.calibrationDueDate && isBefore(new Date(device.calibrationDueDate), new Date()),
  ).length

  const dueSoonCount = devices.filter(
    (device) =>
      device.calibrationDueDate &&
      !isBefore(new Date(device.calibrationDueDate), new Date()) &&
      isBefore(new Date(device.calibrationDueDate), addMonths(new Date(), 1)),
  ).length

  return (
    <>
      <div className="grid gap-4 mb-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring calibration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Calibration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Within 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{dueSoonCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Schedule soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Up to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{devices.length - overdueCount - dueSoonCount}</div>
            <p className="text-xs text-muted-foreground mt-1">No action needed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex flex-1 gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <h4 className="font-medium">Calibration Filters</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-overdue"
                      checked={activeFilters.includes("overdue")}
                      onCheckedChange={() => toggleFilter("overdue")}
                    />
                    <Label htmlFor="filter-overdue">Overdue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-due-soon"
                      checked={activeFilters.includes("due-soon")}
                      onCheckedChange={() => toggleFilter("due-soon")}
                    />
                    <Label htmlFor="filter-due-soon">Due Soon (30 days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-sales"
                      checked={activeFilters.includes("sales")}
                      onCheckedChange={() => toggleFilter("sales")}
                    />
                    <Label htmlFor="filter-sales">Sales Devices</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-rental"
                      checked={activeFilters.includes("rental")}
                      onCheckedChange={() => toggleFilter("rental")}
                    />
                    <Label htmlFor="filter-rental">Rental Devices</Label>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button size="sm">Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calibration Reminder</CardTitle>
          <CardDescription>Track and manage device calibration schedules.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Meter Name</TableHead>
                <TableHead>Meter Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Last Calibration Date</TableHead>
                <TableHead>Next Calibration Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => {
                const user = getUserForDevice(device.id)
                const isOverdue = device.calibrationDueDate && isBefore(new Date(device.calibrationDueDate), new Date())
                const isDueSoon =
                  device.calibrationDueDate &&
                  !isOverdue &&
                  isBefore(new Date(device.calibrationDueDate), addMonths(new Date(), 1))

                return (
                  <TableRow key={device.id}>
                    <TableCell>{user ? user.company || "N/A" : "N/A"}</TableCell>
                    <TableCell>{user ? user.name : "Unassigned"}</TableCell>
                    <TableCell>{user ? user.email : "N/A"}</TableCell>
                    <TableCell>{user ? user.phone || "N/A" : "N/A"}</TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.model || "N/A"}</TableCell>
                    <TableCell>{device.serialNumber || "N/A"}</TableCell>
                    <TableCell>{device.lastCalibrationDate || "Not recorded"}</TableCell>
                    <TableCell>
                      {device.calibrationDueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {device.calibrationDueDate}
                        </div>
                      ) : (
                        "Not set"
                      )}
                    </TableCell>
                    <TableCell>
                      {isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : isDueSoon ? (
                        <Badge  className="bg-amber-500 hover:bg-amber-600">
                          Due Soon
                        </Badge>
                      ) : (
                        <Badge variant="outline">Up to Date</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
