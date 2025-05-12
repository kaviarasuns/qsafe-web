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
import {
  Search,
  PlusCircle,
  X,
  Calendar,
  Upload,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
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
import { format, addMonths, addYears, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company?: string;
  username?: string;
  password?: string;
  location?: string;
}

interface Device {
  id: string;
  name: string;
  location: string;
  status: string;
  deviceType: "Sales" | "Rental";
  calibrationDueDate?: string;
  serialNumber?: string;
  basePrice?: number;
  calibrationDate?: string;
  calibrationCertificate?: string;
  photos?: string[];
  alerts?: {
    email?: string[];
    whatsapp?: string[];
    sms?: string[];
  };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deviceToAssign, setDeviceToAssign] = useState<Device | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignmentType, setAssignmentType] = useState<"Sales" | "Rental">(
    "Rental"
  );
  const [basePrice, setBasePrice] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [calibrationDate, setCalibrationDate] = useState<Date | undefined>(
    undefined
  );
  const [calibrationDueDate, setCalibrationDueDate] = useState<
    Date | undefined
  >(undefined);
  const [alertEmail, setAlertEmail] = useState<string>("");
  const [alertWhatsapp, setAlertWhatsapp] = useState<string>("");
  const [alertSms, setAlertSms] = useState<string>("");
  const [isUserDevicesDialogOpen, setIsUserDevicesDialogOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDueOpen, setCalendarDueOpen] = useState(false);

  // Get all assigned devices (to any user)
  const allAssignedDeviceIds = accessRights
    .filter((access) => access.granted)
    .map((access) => access.deviceId);

  // Get unassigned devices (not assigned to any user)
  const unassignedDevices = devices.filter(
    (device) => !allAssignedDeviceIds.includes(device.id)
  );

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.location &&
        user.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter devices based on search term
  const filteredUnassignedDevices = unassignedDevices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.serialNumber &&
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get devices assigned to a specific user
  const getUserDevices = (userId: number) => {
    return accessRights
      .filter((access) => access.userId === userId && access.granted)
      .map((access) => {
        const device = devices.find((d) => d.id === access.deviceId);
        return {
          ...device,
          assignedDate: access.assignedDate || format(new Date(), "yyyy-MM-dd"),
          dueDate:
            access.dueDate || format(addMonths(new Date(), 1), "yyyy-MM-dd"),
          deviceType: access.deviceType || "Rental",
        };
      })
      .filter(Boolean);
  };

  const handleOpenAssignDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsAssignDialogOpen(true);
  };

  const handleSelectDeviceToAssign = (device: Device) => {
    setDeviceToAssign(device);
    setAssignmentType(device.deviceType || "Rental");
    setBasePrice("");
    setSerialNumber(device.serialNumber || "");
    setCalibrationDate(
      device.calibrationDate ? parseISO(device.calibrationDate) : undefined
    );
    setCalibrationDueDate(
      device.calibrationDueDate
        ? parseISO(device.calibrationDueDate)
        : undefined
    );
    setAlertEmail("");
    setAlertWhatsapp("");
    setAlertSms("");
    setIsAssignDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (deviceToAssign && selectedUserId !== null) {
      // In a real app, you would update the access rights with the assignment details
      onToggleAccess(selectedUserId, deviceToAssign.id);

      // Update the device with additional details
      const updatedDevice = {
        ...deviceToAssign,
        deviceType: assignmentType,
        basePrice: basePrice ? Number.parseFloat(basePrice) : undefined,
        serialNumber: serialNumber || deviceToAssign.serialNumber,
        calibrationDate: calibrationDate
          ? format(calibrationDate, "yyyy-MM-dd")
          : deviceToAssign.calibrationDate,
        calibrationDueDate: calibrationDueDate
          ? format(calibrationDueDate, "yyyy-MM-dd")
          : deviceToAssign.calibrationDueDate,
        alerts: {
          email: alertEmail
            ? alertEmail.split(",").map((e) => e.trim())
            : deviceToAssign.alerts?.email,
          whatsapp: alertWhatsapp
            ? alertWhatsapp.split(",").map((w) => w.trim())
            : deviceToAssign.alerts?.whatsapp,
          sms: alertSms
            ? alertSms.split(",").map((s) => s.trim())
            : deviceToAssign.alerts?.sms,
        },
      };

      // In a real app, you would update the device in your database
      console.log("Updated device:", updatedDevice);

      setIsConfirmDialogOpen(false);
      setDeviceToAssign(null);
      setSelectedUserId(null);
    }
  };

  const handleViewUserDevices = (userId: number) => {
    setViewingUserId(userId);
    setIsUserDevicesDialogOpen(true);
  };

  const handleUnassignDevice = (userId: number, deviceId: string) => {
    onToggleAccess(userId, deviceId);
  };

  const handleCalibrationDateChange = (date: Date | undefined) => {
    setCalibrationDate(date);
    if (date) {
      setCalibrationDueDate(addYears(date, 1));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Manage which users can access specific devices.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users or devices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned Devices</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const userDevices = getUserDevices(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleViewUserDevices(user.id)}
                    >
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.company || "-"}</TableCell>
                    <TableCell>{user.location || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{userDevices.length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenAssignDialog(user.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Assign Device
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Assign Device Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Device to User</DialogTitle>
            <DialogDescription>
              Select a device to assign to{" "}
              {users.find((u) => u.id === selectedUserId)?.name}
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
                  {filteredUnassignedDevices.map((device) => (
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
                            device.status === "Online" ? "default" : "secondary"
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
                  {filteredUnassignedDevices.length === 0 && (
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

      {/* Confirm Assignment Dialog with Extended Details */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Device Assignment Details</DialogTitle>
            <DialogDescription>
              Configure the assignment of {deviceToAssign?.name} (
              {deviceToAssign?.id}) to{" "}
              {users.find((u) => u.id === selectedUserId)?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="calibration">Calibration</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="basePrice">Base Price / Month</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      placeholder="Enter base price"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      value={deviceToAssign?.name || ""}
                      disabled
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Enter serial number"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                    />
                  </div>
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

                <div className="grid gap-2">
                  <Label htmlFor="photos">Photos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="photos"
                      type="file"
                      multiple
                      className="hidden"
                    />
                    <Label
                      htmlFor="photos"
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photos
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      No files selected
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calibration" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calibrationDate">Calibration Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {calibrationDate
                            ? format(calibrationDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={calibrationDate}
                          onSelect={(date) => {
                            handleCalibrationDateChange(date);
                            setCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calibrationDueDate">
                      Calibration Due Date
                    </Label>
                    <Popover
                      open={calendarDueOpen}
                      onOpenChange={setCalendarDueOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {calibrationDueDate
                            ? format(calibrationDueDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={calibrationDueDate}
                          onSelect={(date) => {
                            setCalibrationDueDate(date);
                            setCalendarDueOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs text-muted-foreground">
                      Automatically set to 12 months after calibration date
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="calibrationCertificate">
                    Calibration Certificate
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="calibrationCertificate"
                      type="file"
                      className="hidden"
                    />
                    <Label
                      htmlFor="calibrationCertificate"
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Certificate
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      No file selected
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="alertEmail">Email Alerts</Label>
                    </div>
                    <Input
                      id="alertEmail"
                      placeholder="Enter email addresses (comma separated)"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">
                      Multiple emails can be separated by commas
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="alertWhatsapp">WhatsApp Alerts</Label>
                    </div>
                    <Input
                      id="alertWhatsapp"
                      placeholder="Enter WhatsApp numbers (comma separated)"
                      value={alertWhatsapp}
                      onChange={(e) => setAlertWhatsapp(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <Label htmlFor="alertSms">SMS Alerts</Label>
                    </div>
                    <Input
                      id="alertSms"
                      placeholder="Enter phone numbers (comma separated)"
                      value={alertSms}
                      onChange={(e) => setAlertSms(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment}>
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Devices Dialog */}
      <Dialog
        open={isUserDevicesDialogOpen}
        onOpenChange={setIsUserDevicesDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Devices Assigned to{" "}
              {users.find((u) => u.id === viewingUserId)?.name}
            </DialogTitle>
            <DialogDescription>
              Manage devices assigned to this user
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingUserId &&
                    getUserDevices(viewingUserId).map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-mono text-sm">
                          {device.id || '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {device.name || '-'}
                        </TableCell>
                        <TableCell>{device.location || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "Online"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {device.status || 'Offline'}
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
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              viewingUserId && device.id &&
                              handleUnassignDevice(viewingUserId, device.id)
                            }
                          >
                            <X className="h-4 w-4 mr-1" />
                            Unassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {viewingUserId &&
                    getUserDevices(viewingUserId).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No devices assigned to this user
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
              onClick={() => setIsUserDevicesDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
