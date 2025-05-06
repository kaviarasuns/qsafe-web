"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: number
  name: string
  email: string
  role: string
  company?: string
  phone?: string
  notificationEmails?: string
}

interface UserManagementProps {
  users: User[]
  onAddUser: (user: Omit<User, "id">) => void
}

export default function UserManagement({ users, onAddUser }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    notificationEmails: "",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const validateForm = () => {
    if (newUser.password !== newUser.confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    if (newUser.password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return false
    }

    setPasswordError("")
    return true
  }

  const handleAddUser = () => {
    if (!validateForm()) return

    const { confirmPassword, ...userToAdd } = newUser
    onAddUser(userToAdd)
    setNewUser({
      name: "",
      email: "",
      role: "User",
      password: "",
      confirmPassword: "",
      company: "",
      phone: "",
      notificationEmails: "",
    })
    setIsDialogOpen(false)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with access credentials.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password*</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              {passwordError && <div className="text-sm text-red-500">{passwordError}</div>}

              <div className="grid gap-2">
                <Label htmlFor="notificationEmails">
                  Notification Email Addresses
                  <span className="text-xs text-muted-foreground ml-2">(Comma separated)</span>
                </Label>
                <Textarea
                  id="notificationEmails"
                  placeholder="email1@example.com, email2@example.com"
                  value={newUser.notificationEmails}
                  onChange={(e) => setNewUser({ ...newUser, notificationEmails: e.target.value })}
                  className="resize-none"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  These email addresses will receive notifications about this user's account, including login
                  credentials.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
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
    </>
  )
}
