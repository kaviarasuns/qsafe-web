"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Search,
  Upload,
  Settings,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, addMonths } from "date-fns";

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
  billing?: {
    type: string;
    paymentStatus: string;
    lastPayment: string;
  };
}

interface DeviceManagementProps {
  devices: Device[];
  onAddDevice: (device: Omit<Device, "id"> & { id?: string }) => void;
  onUpdateDeviceConfig: (deviceId: string, config: any) => void;
}

export default function DeviceManagement({
  devices,
  onAddDevice,
  onUpdateDeviceConfig,
}: DeviceManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newDevice, setNewDevice] = useState({
    id: "",
    name: "",
    location: "",
    status: "Offline",
    deviceType: "Rental" as "Sales" | "Rental",
    installedDate: format(new Date(), "yyyy-MM-dd"),
    calibrationDueDate: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [tempConfig, setTempConfig] = useState<DeviceConfiguration>({});
  const [confirmConfig, setConfirmConfig] = useState(false);
  const [addDeviceTab, setAddDeviceTab] = useState("single");
  const [csvError, setCsvError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate summary counts
  const totalDevices = devices.length;
  const connectedDevices = devices.filter(
    (device) => device.status === "Online"
  ).length;
  const disconnectedDevices = devices.filter(
    (device) => device.status === "Offline"
  ).length;
  const salesDevices = devices.filter(
    (device) => device.deviceType === "Sales"
  ).length;
  const rentalDevices = devices.filter(
    (device) => device.deviceType === "Rental"
  ).length;

  // Calculate devices due for calibration (within next 30 days)
  const today = new Date();
  const nextMonth = addMonths(today, 1);
  const devicesForCalibration = devices.filter((device) => {
    if (!device.calibrationDueDate) return false;
    const dueDate = new Date(device.calibrationDueDate);
    return dueDate <= nextMonth && dueDate >= today;
  }).length;

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDevice = () => {
    onAddDevice({
      ...newDevice,
      configuration: {
        reportInterval: 5,
        threshold: 30,
        vibration: false,
        lutronNoise: false,
        values: 0,
      },
    });
    setNewDevice({
      id: "",
      name: "",
      location: "",
      status: "Offline",
      deviceType: "Rental" as "Sales" | "Rental",
      installedDate: format(new Date(), "yyyy-MM-dd"),
      calibrationDueDate: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
    });
    setIsAddDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split("\n");

        // Skip header row and process each line
        const header = lines[0].split(",");
        const requiredColumns = ["id", "name", "location"];

        // Validate header
        const hasRequiredColumns = requiredColumns.every((col) =>
          header.map((h) => h.trim().toLowerCase()).includes(col.toLowerCase())
        );

        if (!hasRequiredColumns) {
          setCsvError(
            "CSV file must contain columns for: id, name, and location"
          );
          return;
        }

        // Find column indices
        const idIndex = header.findIndex(
          (h) => h.trim().toLowerCase() === "id"
        );
        const nameIndex = header.findIndex(
          (h) => h.trim().toLowerCase() === "name"
        );
        const locationIndex = header.findIndex(
          (h) => h.trim().toLowerCase() === "location"
        );

        // Process each device
        const newDevices = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const values = lines[i].split(",");
          if (values.length < header.length) continue;

          const device = {
            id: values[idIndex].trim(),
            name: values[nameIndex].trim(),
            location: values[locationIndex].trim(),
            status: "Offline",
            deviceType: "Rental" as "Sales" | "Rental",
            installedDate: format(new Date(), "yyyy-MM-dd"),
            calibrationDueDate: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
          };

          if (device.id && device.name && device.location) {
            newDevices.push(device);
          }
        }

        if (newDevices.length === 0) {
          setCsvError("No valid devices found in the CSV file");
          return;
        }

        // Add all devices
        newDevices.forEach((device) =>
          onAddDevice({
            ...device,
            configuration: {
              reportInterval: 5,
              threshold: 30,
              vibration: false,
              lutronNoise: false,
              values: 0,
            },
          })
        );
        setIsAddDialogOpen(false);
        setCsvError("");

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        setCsvError("Error processing CSV file. Please check the format.");
      }
    };

    reader.readAsText(file);
  };

  const openConfigDialog = (device: Device) => {
    setSelectedDevice(device);
    setTempConfig({ ...device.configuration });
    setConfirmConfig(false);
    setIsConfigDialogOpen(true);
  };

  const saveConfiguration = () => {
    if (selectedDevice && confirmConfig) {
      onUpdateDeviceConfig(selectedDevice.id, tempConfig);
      setIsConfigDialogOpen(false);
      setConfirmConfig(false);
    }
  };

  const renderConfigFields = () => {
    if (!selectedDevice) return null;

    return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <Label htmlFor="vibration">Vibration</Label>
          <Switch
            id="vibration"
            checked={tempConfig.vibration || false}
            onCheckedChange={(checked) =>
              setTempConfig({ ...tempConfig, vibration: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between space-y-2">
          <Label htmlFor="lutronNoise">Lutron Noise</Label>
          <Switch
            id="lutronNoise"
            checked={tempConfig.lutronNoise || false}
            onCheckedChange={(checked) =>
              setTempConfig({ ...tempConfig, lutronNoise: checked })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="values">Values</Label>
          <Input
            id="values"
            type="number"
            value={tempConfig.values || 0}
            onChange={(e) =>
              setTempConfig({
                ...tempConfig,
                values: Number.parseInt(e.target.value),
              })
            }
          />
        </div>

        {/* <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Device-Specific Configurations</h4>
        </div> */}

        {/* Different configuration fields based on device type */}
        {/* {selectedDevice.name.includes("Temperature") && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="reportInterval">Report Interval (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="reportInterval"
                  min={1}
                  max={60}
                  step={1}
                  value={[tempConfig.reportInterval || 5]}
                  onValueChange={(value) =>
                    setTempConfig({ ...tempConfig, reportInterval: value[0] })
                  }
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {tempConfig.reportInterval || 5}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Temperature Threshold (°C)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="threshold"
                  min={0}
                  max={50}
                  step={1}
                  value={[tempConfig.threshold || 30]}
                  onValueChange={(value) =>
                    setTempConfig({ ...tempConfig, threshold: value[0] })
                  }
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {tempConfig.threshold || 30}°C
                </span>
              </div>
            </div>
          </>
        )} */}

        {selectedDevice.name.includes("Lock") && (
          <>
            <div className="flex items-center justify-between space-y-2">
              <Label htmlFor="autoLock">Auto Lock</Label>
              <Switch
                id="autoLock"
                checked={tempConfig.autoLock}
                onCheckedChange={(checked) =>
                  setTempConfig({ ...tempConfig, autoLock: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-y-2">
              <Label htmlFor="pinRequired">PIN Required</Label>
              <Switch
                id="pinRequired"
                checked={tempConfig.pinRequired}
                onCheckedChange={(checked) =>
                  setTempConfig({ ...tempConfig, pinRequired: checked })
                }
              />
            </div>
          </>
        )}

        {selectedDevice.name.includes("Camera") && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select
                value={tempConfig.resolution || "1080p"}
                onValueChange={(value) =>
                  setTempConfig({ ...tempConfig, resolution: value })
                }
              >
                <SelectTrigger id="resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-y-2">
              <Label htmlFor="motionDetection">Motion Detection</Label>
              <Switch
                id="motionDetection"
                checked={tempConfig.motionDetection}
                onCheckedChange={(checked) =>
                  setTempConfig({ ...tempConfig, motionDetection: checked })
                }
              />
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {connectedDevices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {disconnectedDevices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {salesDevices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rental Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {rentalDevices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Due for Calibration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {devicesForCalibration}
            </div>
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Register a new IoT device in the system.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={addDeviceTab} onValueChange={setAddDeviceTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Device</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deviceId">Device ID</Label>
                    <Input
                      id="deviceId"
                      value={newDevice.id}
                      onChange={(e) =>
                        setNewDevice({ ...newDevice, id: e.target.value })
                      }
                      placeholder="e.g., DEV123"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to auto-generate an ID
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Device Name</Label>
                    <Input
                      id="name"
                      value={newDevice.name}
                      onChange={(e) =>
                        setNewDevice({ ...newDevice, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newDevice.location}
                      onChange={(e) =>
                        setNewDevice({ ...newDevice, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select
                      value={newDevice.deviceType}
                      onValueChange={(value: "Sales" | "Rental") =>
                        setNewDevice({ ...newDevice, deviceType: value })
                      }
                    >
                      <SelectTrigger id="deviceType">
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Rental">Rental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="installedDate">Installed Date</Label>
                    <Input
                      id="installedDate"
                      type="date"
                      value={newDevice.installedDate}
                      onChange={(e) =>
                        setNewDevice({
                          ...newDevice,
                          installedDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="calibrationDueDate">
                      Next Calibration Date
                    </Label>
                    <Input
                      id="calibrationDueDate"
                      type="date"
                      value={newDevice.calibrationDueDate}
                      onChange={(e) =>
                        setNewDevice({
                          ...newDevice,
                          calibrationDueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddDevice}>Add Device</Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="csvFile">Upload CSV File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      CSV file must include columns for: id, name, and location
                    </p>
                  </div>

                  {csvError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{csvError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Sample CSV Format</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      id,name,location
                      <br />
                      DEV001,Temperature Sensor,Living Room
                      <br />
                      DEV002,Smart Lock,Front Door
                      <br />
                      DEV003,Security Camera,Backyard
                    </pre>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IoT Devices</CardTitle>
          <CardDescription>Manage registered IoT devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Next Calibration</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-mono text-sm">
                    {device.id}
                  </TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
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
                        device.deviceType === "Sales" ? "outline" : "default"
                      }
                    >
                      {device.deviceType}
                    </Badge>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openConfigDialog(device)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDevices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
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

      {/* Device Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Device Configuration</DialogTitle>
            <DialogDescription>
              {selectedDevice
                ? `Configure settings for ${selectedDevice.name} (${selectedDevice.id})`
                : "Configure device settings"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {renderConfigFields()}

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="confirmChanges"
                checked={confirmConfig}
                onCheckedChange={(checked) =>
                  setConfirmConfig(checked as boolean)
                }
              />
              <Label htmlFor="confirmChanges" className="text-sm">
                I confirm that I want to update the device configuration
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveConfiguration} disabled={!confirmConfig}>
              Set Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
