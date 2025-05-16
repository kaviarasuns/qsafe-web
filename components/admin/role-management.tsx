"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { AdminRole } from "@/contexts/admin-context"

interface User {
  id: number
  name: string
  email: string
  role: string
  adminRole: AdminRole
}

interface RoleManagementProps {
  users: User[]
  onUpdateUserRole: (userId: number, role: AdminRole) => void
}

export default function RoleManagement({ users, onUpdateUserRole }: RoleManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminRole>(null)
  const [customPermissions, setCustomPermissions] = useState({
    users: false,
    devices: false,
    access: false,
    billing: false,
    calibration: false,
    service: false,
  })

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.adminRole)
    setIsEditDialogOpen(true)
  }

  const handleSaveRole = () => {
    if (selectedUser) {
      onUpdateUserRole(selectedUser.id, selectedRole)
      setIsEditDialogOpen(false)
    }
  }

  // Format role for display
  const formatRole = (role: string | null) => {
    if (!role) return "No Admin Access"
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User Role</TableHead>
                <TableHead>Admin Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.adminRole ? "default" : "secondary"}>{formatRole(user.adminRole)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Update role for ${selectedUser.name}` : "Update user role"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Admin Role</Label>
                <Select value={selectedRole || ""} onValueChange={(value) => setSelectedRole(value as AdminRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Admin Access</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="billing_admin">Billing Admin</SelectItem>
                    <SelectItem value="inventory_admin">Inventory Admin</SelectItem>
                    <SelectItem value="calibration_lab_admin">Calibration Lab Admin</SelectItem>
                    <SelectItem value="qsafe_admin">QSafe Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Role Permissions</h4>
                <div className="text-sm text-muted-foreground mb-4">
                  {selectedRole === "super_admin" && "Full access to all features and functionalities."}
                  {selectedRole === "billing_admin" && "Access to billing features only."}
                  {selectedRole === "inventory_admin" &&
                    "Access to user management, device management, and access control."}
                  {selectedRole === "calibration_lab_admin" && "Access to calibration reminder features only."}
                  {selectedRole === "qsafe_admin" && "Access to service reminder features only."}
                  {!selectedRole && "No admin access. User will be redirected to the user dashboard."}
                </div>

                {/* Custom permissions section - for future use */}
                {false && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="users-permission"
                        checked={customPermissions.users}
                        onCheckedChange={(checked) => setCustomPermissions({ ...customPermissions, users: !!checked })}
                      />
                      <Label htmlFor="users-permission">User Management</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="devices-permission"
                        checked={customPermissions.devices}
                        onCheckedChange={(checked) =>
                          setCustomPermissions({ ...customPermissions, devices: !!checked })
                        }
                      />
                      <Label htmlFor="devices-permission">Device Management</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="access-permission"
                        checked={customPermissions.access}
                        onCheckedChange={(checked) => setCustomPermissions({ ...customPermissions, access: !!checked })}
                      />
                      <Label htmlFor="access-permission">Access Control</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billing-permission"
                        checked={customPermissions.billing}
                        onCheckedChange={(checked) =>
                          setCustomPermissions({ ...customPermissions, billing: !!checked })
                        }
                      />
                      <Label htmlFor="billing-permission">Billing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="calibration-permission"
                        checked={customPermissions.calibration}
                        onCheckedChange={(checked) =>
                          setCustomPermissions({ ...customPermissions, calibration: !!checked })
                        }
                      />
                      <Label htmlFor="calibration-permission">Calibration Reminder</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="service-permission"
                        checked={customPermissions.service}
                        onCheckedChange={(checked) =>
                          setCustomPermissions({ ...customPermissions, service: !!checked })
                        }
                      />
                      <Label htmlFor="service-permission">Service Reminder</Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
