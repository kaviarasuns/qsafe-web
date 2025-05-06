"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  name: string
  email: string
  role: string
  company?: string
}

interface Device {
  id: string
  name: string
  location: string
  status: string
}

interface AccessRight {
  userId: number
  deviceId: string
  granted: boolean
}

interface AccessControlProps {
  users: User[]
  devices: Device[]
  accessRights: AccessRight[]
  onToggleAccess: (userId: number, deviceId: string) => void
}

export default function AccessControl({ users, devices, accessRights, onToggleAccess }: AccessControlProps) {
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const hasAccess = (userId: number, deviceId: string) => {
    const access = accessRights.find((access) => access.userId === userId && access.deviceId === deviceId)
    return access ? access.granted : false
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Control</CardTitle>
        <CardDescription>Manage which users can access specific devices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} {user.company ? `(${user.company})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selectedUser ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-mono text-sm">{device.id}</TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <Badge variant={device.status === "Online" ? "default" : "secondary"}>{device.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={hasAccess(Number.parseInt(selectedUser), device.id)}
                      onCheckedChange={() => onToggleAccess(Number.parseInt(selectedUser), device.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select a user to manage their device access
          </div>
        )}
      </CardContent>
    </Card>
  )
}
