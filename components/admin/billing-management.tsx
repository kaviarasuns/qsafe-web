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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Calendar, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  billing?: {
    type: string;
    paymentStatus: string;
    lastPayment: string;
  };
}

interface AccessRight {
  userId: number;
  deviceId: string;
  granted: boolean;
}

interface BillingManagementProps {
  devices: Device[];
  users: User[];
  accessRights: AccessRight[];
  blockedDevices: string[];
  onToggleDeviceBlock: (deviceId: string) => void;
}

export default function BillingManagement({
  devices,
  users,
  accessRights,
  blockedDevices,
  onToggleDeviceBlock,
}: BillingManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDevicesDialogOpen, setIsUserDevicesDialogOpen] = useState(false);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleTabClick = (value: string) => {
    setActiveTab(activeTab === value ? null : value);
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserForDevice = (deviceId: string) => {
    const userAccess = accessRights.find(
      (access) => access.deviceId === deviceId && access.granted
    );
    if (!userAccess) return null;

    return users.find((user) => user.id === userAccess.userId) || null;
  };

  const getUserDevices = (userId: number) => {
    const userDeviceIds = accessRights
      .filter((access) => access.userId === userId && access.granted)
      .map((access) => access.deviceId);

    return devices.filter((device) => userDeviceIds.includes(device.id));
  };

  const openUserDevicesDialog = (user: User) => {
    setSelectedUser(user);
    setIsUserDevicesDialogOpen(true);
  };

  const getRentalCount = () => {
    return devices.filter((device) => device.billing?.type === "Rental").length;
  };

  const getSalesCount = () => {
    return devices.filter((device) => device.billing?.type === "Purchase")
      .length;
  };

  const getOverdueCount = () => {
    return devices.filter(
      (device) => device.billing?.paymentStatus === "Overdue"
    ).length;
  };

  return (
    <>
      <div className="grid gap-4 mb-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {devices.filter((d) => d.status === "Online").length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rental Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRentalCount()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sold Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSalesCount()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              One-time purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOverdueCount()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab || ""} className="w-full md:w-auto relative">
          <TabsList>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-1"
              onClick={() =>
                setActiveTab(activeTab === "settings" ? null : "settings")
              }
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Payment Cycle</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-1"
              onClick={() =>
                setActiveTab(
                  activeTab === "notifications" ? null : "notifications"
                )
              }
            >
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {activeTab && (
            <>
              <TabsContent
                value="settings"
                className="absolute right-0 mt-2 w-[300px] rounded-md border bg-background shadow-md z-50"
              >
                <div className="p-4">
                  <h4 className="font-medium mb-2">Payment Cycle Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Billing Cycle</span>
                      <Select defaultValue="monthly">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Billing Date</span>
                      <Select defaultValue="1">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st of month</SelectItem>
                          <SelectItem value="15">15th of month</SelectItem>
                          <SelectItem value="last">Last day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="notifications"
                className="absolute right-0 mt-2 w-[300px] rounded-md border bg-background shadow-md z-50"
              >
                <div className="p-4">
                  <h4 className="font-medium mb-2">Payment Notifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Alerts</span>
                      <Switch
                        checked={paymentAlerts}
                        onCheckedChange={setPaymentAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reminder Days</span>
                      <Select defaultValue="7">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="7">7 days before</SelectItem>
                          <SelectItem value="14">14 days before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Overview</CardTitle>
          <CardDescription>
            Manage device billing and payment status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => {
                const user = getUserForDevice(device.id);
                const isBlocked = blockedDevices.includes(device.id);

                return (
                  <TableRow
                    key={device.id}
                    className={isBlocked ? "opacity-60" : ""}
                  >
                    <TableCell className="font-mono text-sm">
                      {device.id}
                    </TableCell>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          device.status === "Online" ? "default" : "secondary"
                        }
                      >
                        {device.status}
                      </Badge>
                      {isBlocked && (
                        <Badge variant="destructive" className="ml-2">
                          Blocked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{device.billing?.type || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          device.billing?.paymentStatus === "Overdue"
                            ? "destructive"
                            : device.billing?.paymentStatus === "Current"
                            ? "default"
                            : "outline"
                        }
                      >
                        {device.billing?.paymentStatus || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {device.billing?.lastPayment || "N/A"}
                    </TableCell>
                    <TableCell>
                      {user ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => openUserDevicesDialog(user)}
                        >
                          <User className="h-3.5 w-3.5" />
                          {user.name}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Devices Dialog */}
      <Dialog
        open={isUserDevicesDialogOpen}
        onOpenChange={setIsUserDevicesDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Devices</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? `Devices assigned to ${selectedUser.name}`
                : "User devices"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm">{selectedUser.company || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Devices</p>
                  <p className="text-sm">
                    {getUserDevices(selectedUser.id).length}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUserDevices(selectedUser.id).map((device) => {
                    const isBlocked = blockedDevices.includes(device.id);

                    return (
                      <TableRow
                        key={device.id}
                        className={isBlocked ? "opacity-60" : ""}
                      >
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
                        <TableCell className="text-right">
                          <Button
                            variant={isBlocked ? "default" : "destructive"}
                            size="sm"
                            onClick={() => onToggleDeviceBlock(device.id)}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {getUserDevices(selectedUser.id).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground"
                      >
                        No devices assigned to this user
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
