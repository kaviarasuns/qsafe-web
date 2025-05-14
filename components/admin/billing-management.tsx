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
import { Search, User, Calendar, Bell, DollarSign, Filter } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, differenceInMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface UserType {
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
  installedDate: string;
  calibrationDueDate?: string;
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
  users: UserType[];
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
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isUserDevicesDialogOpen, setIsUserDevicesDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDeviceForPayment, setSelectedDeviceForPayment] =
    useState<Device | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState("");
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const filteredDevices = devices.filter((device) => {
    // Basic search filter
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply additional filters
    if (!matchesSearch) return false;

    if (activeFilters.length === 0) return true;

    return activeFilters.some((filter) => {
      switch (filter) {
        case "overdue":
          return device.billing?.paymentStatus === "Overdue";
        case "blocked":
          return blockedDevices.includes(device.id);
        default:
          return true;
      }
    });
  });

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

  const openUserDevicesDialog = (user: UserType) => {
    setSelectedUser(user);
    setIsUserDevicesDialogOpen(true);
  };

  const openPaymentDialog = (device: Device) => {
    setSelectedDeviceForPayment(device);

    // Calculate due amount based on installed date
    if (device.deviceType === "Rental" && device.installedDate) {
      const installedDate = new Date(device.installedDate);
      const today = new Date();
      const monthsDiff = differenceInMonths(today, installedDate);
      const baseRate = 29.99; // Example monthly rate
      const dueAmount = (monthsDiff + 1) * baseRate;
      setPaymentAmount(dueAmount.toFixed(2));
    } else {
      setPaymentAmount("0.00");
    }

    setPaymentReceipt("");
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = () => {
    // In a real app, you would process the payment and update the device's payment status
    setIsPaymentDialogOpen(false);
    setSelectedDeviceForPayment(null);
  };

  // Calculate summary counts
  const totalDevices = devices.length;
  const connectedDevices = devices.filter(
    (device) => device.status === "Online"
  ).length;
  const disconnectedDevices = devices.filter(
    (device) => device.status === "Offline"
  ).length;
  const disconnectedSalesDevices = devices.filter(
    (device) => device.status === "Offline" && device.deviceType === "Sales"
  ).length;
  const disconnectedRentalDevices = devices.filter(
    (device) => device.status === "Offline" && device.deviceType === "Rental"
  ).length;
  const blockedDevicesCount = blockedDevices.length;
  const rentalCount = devices.filter(
    (device) => device.deviceType === "Rental"
  ).length;
  const salesCount = devices.filter(
    (device) => device.deviceType === "Sales"
  ).length;
  const overdueCount = devices.filter(
    (device) => device.billing?.paymentStatus === "Overdue"
  ).length;

  return (
    <>
      <div className="grid gap-4 mb-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {connectedDevices} online
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
            <div className="text-2xl font-bold">{rentalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesCount}</div>
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
            <div className="text-2xl font-bold">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mb-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Disconnected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {disconnectedDevices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Disconnected Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {disconnectedSalesDevices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              One-time purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Disconnected Rental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {disconnectedRentalDevices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly recurring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Blocked Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {blockedDevicesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Access restricted
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
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Billing</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-overdue"
                    checked={activeFilters.includes("overdue")}
                    onCheckedChange={() => toggleFilter("overdue")}
                  />
                  <Label htmlFor="filter-overdue">All Overdue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-blocked"
                    checked={activeFilters.includes("blocked")}
                    onCheckedChange={() => toggleFilter("blocked")}
                  />
                  <Label htmlFor="filter-blocked">Blocked Users</Label>
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
                <TableHead>User</TableHead>
                <TableHead>Site Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Calibration Due</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => {
                const user = getUserForDevice(device.id);
                const isBlocked = blockedDevices.includes(device.id);

                // Calculate due amount based on installed date
                let dueAmount = 0;
                if (device.deviceType === "Rental" && device.installedDate) {
                  const installedDate = new Date(device.installedDate);
                  const today = new Date();
                  const monthsDiff = differenceInMonths(today, installedDate);
                  const baseRate = 29.99; // Example monthly rate
                  dueAmount = (monthsDiff + 1) * baseRate;
                }

                return (
                  <TableRow
                    key={device.id}
                    className={isBlocked ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      {user ? user.name : "Unassigned"}
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
                    <TableCell>
                      <Badge
                        variant={
                          device.deviceType === "Sales" ? "outline" : "default"
                        }
                      >
                        {device.deviceType}
                      </Badge>
                    </TableCell>
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
                      {device.deviceType === "Rental" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ${dueAmount.toFixed(2)} due
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {device.billing?.lastPayment || "N/A"}
                    </TableCell>
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
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Main Button */}
                        {/* <Button
                          variant={isBlocked ? "default" : "destructive"}
                          size="sm"
                          onClick={() => onToggleDeviceBlock(device.id)}
                        >
                          {isBlocked ? "Unblock" : "Block"}
                        </Button> */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDialog(device)}
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Mark Paid
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
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
        <DialogContent className="sm:max-w-[700px]">
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
                          <div className="flex gap-2">
                            <Button
                              variant={isBlocked ? "default" : "destructive"}
                              size="sm"
                              onClick={() => onToggleDeviceBlock(device.id)}
                            >
                              {isBlocked ? "Unblock" : "Block"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentDialog(device)}
                              className="flex items-center gap-1"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              Mark Paid
                            </Button>
                          </div>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              {selectedDeviceForPayment
                ? `Record payment for ${selectedDeviceForPayment.name} (${selectedDeviceForPayment.id})`
                : "Record device payment"}
            </DialogDescription>
          </DialogHeader>

          {selectedDeviceForPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Device</p>
                  <p className="text-sm">{selectedDeviceForPayment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID</p>
                  <p className="text-sm font-mono">
                    {selectedDeviceForPayment.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">
                    {selectedDeviceForPayment.deviceType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Installed Date</p>
                  <p className="text-sm">
                    {selectedDeviceForPayment.installedDate || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentReceipt">Payment Receipt/Notes</Label>
                <Textarea
                  id="paymentReceipt"
                  placeholder="Enter payment details, receipt number, or notes"
                  value={paymentReceipt}
                  onChange={(e) => setPaymentReceipt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nextDueDate">Next Due</Label>
                <Select defaultValue="1">
                  <SelectTrigger id="nextDueDate">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">After 1 month</SelectItem>
                    <SelectItem value="2">After 2 months</SelectItem>
                    <SelectItem value="3">After 3 months</SelectItem>
                    <SelectItem value="6">After 6 months</SelectItem>
                    <SelectItem value="12">After 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="billingNotifications">
                  Billing Notifications
                </Label>
                <Switch
                  id="billingNotifications"
                  checked={paymentAlerts}
                  onCheckedChange={setPaymentAlerts}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
