"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserPlus, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@/types";

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, "id">) => void;
  onUpdateUser: (userId: number, userData: Partial<User>) => void;
}

export default function UserManagement({
  users,
  onAddUser,
  onUpdateUser,
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    notificationEmails: "",
    adminType: null as "full" | "billing" | null,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordError, setPasswordError] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company &&
        user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validateForm = () => {
    if (newUser.password !== newUser.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    if (newUser.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleAddUser = () => {
    if (!validateForm()) return;

    const { confirmPassword, ...userToAdd } = newUser;
    onAddUser(userToAdd);
    setNewUser({
      name: "",
      email: "",
      role: "User",
      password: "",
      confirmPassword: "",
      company: "",
      phone: "",
      notificationEmails: "",
      adminType: null,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    onUpdateUser(editingUser.id, editingUser);
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const getAdminTypeBadge = (adminType: "full" | "billing" | null) => {
    if (!adminType) return null;
    return (
      <Badge
        variant={adminType === "full" ? "default" : "secondary"}
        className="ml-2"
      >
        {adminType === "full" ? "Full Access" : "Billing Access"}
      </Badge>
    );
  };

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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with access credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newUser.company}
                    onChange={(e) =>
                      setNewUser({ ...newUser, company: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password*</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {passwordError && (
                <div className="text-sm text-red-500">{passwordError}</div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="role">User Role*</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => {
                    if (value === "User") {
                      setNewUser({ ...newUser, role: value, adminType: null });
                    } else {
                      setNewUser({ ...newUser, role: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">Regular User</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.role === "Admin" && (
                <div className="grid gap-2">
                  <Label>Admin Privileges</Label>
                  <RadioGroup
                    value={newUser.adminType || ""}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        adminType: value as "full" | "billing" | null,
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full">Full Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="billing" id="billing" />
                      <Label htmlFor="billing">Billing Access Only</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notificationEmails">
                  Notification Email Addresses
                  <span className="text-xs text-muted-foreground ml-2">
                    (Comma separated)
                  </span>
                </Label>
                <Textarea
                  id="notificationEmails"
                  placeholder="email1@example.com, email2@example.com"
                  value={newUser.notificationEmails}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      notificationEmails: e.target.value,
                    })
                  }
                  className="resize-none"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  These email addresses will receive notifications about this
                  user's account, including login credentials.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
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
          <CardDescription>
            Manage user accounts and credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
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
                  <TableCell>
                    {user.role}
                    {user.adminType && getAdminTypeBadge(user.adminType)}
                  </TableCell>
                  <TableCell>{user.company || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name*</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingUser.company || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        company: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email Address*</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingUser.phone || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">User Role*</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => {
                    if (value === "User") {
                      setEditingUser({
                        ...editingUser,
                        role: value,
                        adminType: null,
                      });
                    } else {
                      setEditingUser({ ...editingUser, role: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">Regular User</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser.role === "Admin" && (
                <div className="grid gap-2">
                  <Label>Admin Privileges</Label>
                  <RadioGroup
                    value={editingUser.adminType || ""}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        adminType: value as "full" | "billing" | null,
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="edit-full" />
                      <Label htmlFor="edit-full">Full Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="billing" id="edit-billing" />
                      <Label htmlFor="edit-billing">Billing Access Only</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-notificationEmails">
                  Notification Email Addresses
                  <span className="text-xs text-muted-foreground ml-2">
                    (Comma separated)
                  </span>
                </Label>
                <Textarea
                  id="edit-notificationEmails"
                  placeholder="email1@example.com, email2@example.com"
                  value={editingUser.notificationEmails || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      notificationEmails: e.target.value,
                    })
                  }
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
