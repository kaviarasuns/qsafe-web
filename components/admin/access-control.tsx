"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, addMonths } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company?: string;
}

interface Device {
  id: string;
  name: string;
  location: string;
  status: string;
  deviceType: "Sales" | "Rental";
  calibrationDueDate?: string;
}

interface AccessRight {
  userId: number;
  deviceId: string;
  granted: boolean;
  assignedDate?: string;
  dueDate?: string;
  deviceType?: "Sales" | "Rental";
}

interface AccessControlProps {
  users: User[];
  devices: Device[];
  accessRights: AccessRight[];
  onToggleAccess: (userId: number, deviceId: string) => void;
}

export default function AccessControl({
  users,
  devices,
  accessRights,
  onToggleAccess,
}: AccessControlProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deviceToAssign, setDeviceToAssign] = useState<Device | null>(null);
  const [assignmentType, setAssignmentType] = useState<"Sales" | "Rental">(
    "Rental"
  );

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userDevices = selectedUser
    ? accessRights
        .filter(
          (access) => access.userId === Number(selectedUser) && access.granted
        )
        .map((access) => {
          const device = devices.find((d) => d.id === access.deviceId);
          if (!device) return null;
          // Create a properly typed object literal instead of spreading
          const userDevice = {
            id: device.id,
            name: device.name,
            location: device.location,
            status: device.status,
            deviceType: access.deviceType || device.deviceType,
            calibrationDueDate: device.calibrationDueDate,
            assignedDate:
              access.assignedDate || format(new Date(), "yyyy-MM-dd"),
            dueDate:
              access.dueDate || format(addMonths(new Date(), 1), "yyyy-MM-dd"),
          };
          return userDevice;
        })
        .filter(
          (device): device is NonNullable<typeof device> => device !== null
        )
    : [];

  const availableDevices = devices.filter(
    (device) =>
      !accessRights.some(
        (access) =>
          access.deviceId === device.id &&
          access.userId === Number(selectedUser) &&
          access.granted
      )
  );

  const hasAccess = (userId: number, deviceId: string) => {
    const access = accessRights.find(
      (access) => access.userId === userId && access.deviceId === deviceId
    );
    return access ? access.granted : false;
  };

  const handleOpenAssignDialog = () => {
    setIsAssignDialogOpen(true);
  };

  const handleSelectDeviceToAssign = (device: Device) => {
    setDeviceToAssign(device);
    setAssignmentType(device.deviceType || "Rental");
    setIsAssignDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (deviceToAssign && selectedUser) {
      // In a real app, you would update the access rights with the assignment details
      onToggleAccess(Number(selectedUser), deviceToAssign.id);

      // Update the access right with additional details
      const updatedAccessRights = [...accessRights];
      const accessIndex = updatedAccessRights.findIndex(
        (access) =>
          access.userId === Number(selectedUser) &&
          access.deviceId === deviceToAssign.id
      );

      if (accessIndex !== -1) {
        updatedAccessRights[accessIndex] = {
          ...updatedAccessRights[accessIndex],
          assignedDate: format(new Date(), "yyyy-MM-dd"),
          dueDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
          deviceType: assignmentType,
        };
      }

      setIsConfirmDialogOpen(false);
      setDeviceToAssign(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Manage which users can access specific devices.
          </CardDescription>
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

            {selectedUser && (
              <Button onClick={handleOpenAssignDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Assign Device
              </Button>
            )}
          </div>

          {selectedUser ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Assigned Devices</CardTitle>
                  <CardDescription>
                    Devices currently assigned to this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userDevices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device ID</TableHead>
                          <TableHead>Device Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Access</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDevices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-mono text-sm">
                              {device.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {device.name}
                            </TableCell>
                            <TableCell>{device.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  device.status === "Online"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  device.deviceType === "Sales"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                {device.deviceType}
                              </Badge>
                            </TableCell>
                            <TableCell>{device.assignedDate}</TableCell>
                            <TableCell>{device.dueDate}</TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={true}
                                onCheckedChange={() =>
                                  onToggleAccess(
                                    Number(selectedUser),
                                    device.id
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No devices assigned to this user
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Available Devices</CardTitle>
                  <CardDescription>
                    All devices that can be assigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search devices..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device ID</TableHead>
                        <TableHead>Device Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableDevices
                        .filter(
                          (device) =>
                            device.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            device.location
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            device.id
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-mono text-sm">
                              {device.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {device.name}
                            </TableCell>
                            <TableCell>{device.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  device.status === "Online"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  device.deviceType === "Sales"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                {device.deviceType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={hasAccess(
                                  Number.parseInt(selectedUser),
                                  device.id
                                )}
                                onCheckedChange={() =>
                                  onToggleAccess(
                                    Number.parseInt(selectedUser),
                                    device.id
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      {availableDevices.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-4 text-muted-foreground"
                          >
                            No available devices found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Please select a user to manage their device access
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Device Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Device to User</DialogTitle>
            <DialogDescription>
              Select a device to assign to{" "}
              {users.find((u) => u.id.toString() === selectedUser)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search available devices..."
                className="pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableDevices
                    .filter(
                      (device) =>
                        device.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        device.location
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        device.id
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-mono text-sm">
                          {device.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {device.name}
                        </TableCell>
                        <TableCell>{device.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "Online"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {device.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.deviceType === "Sales"
                                ? "outline"
                                : "default"
                            }
                          >
                            {device.deviceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectDeviceToAssign(device)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {availableDevices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No available devices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Assignment Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Device Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to assign {deviceToAssign?.name} (
              {deviceToAssign?.id}) to{" "}
              {users.find((u) => u.id.toString() === selectedUser)?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignmentType">Assignment Type</Label>
                <Select
                  value={assignmentType}
                  onValueChange={(value: "Sales" | "Rental") =>
                    setAssignmentType(value)
                  }
                >
                  <SelectTrigger id="assignmentType">
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <div className="text-sm">
                  {format(addMonths(new Date(), 1), "MMMM d, yyyy")}
                  <span className="text-muted-foreground ml-2">
                    (Automatically set to 1 month from today)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssignment}>
              Confirm Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
