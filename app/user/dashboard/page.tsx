"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserHeader from "@/components/user/user-header"
import DeviceCard from "@/components/user/device-card"

// Sample data for demonstration
const userDevices = [
  {
    id: 1,
    name: "Temperature Sensor",
    location: "Living Room",
    status: "Online",
    data: [
      { timestamp: "08:00", value: "22°C" },
      { timestamp: "09:00", value: "23°C" },
      { timestamp: "10:00", value: "24°C" },
      { timestamp: "11:00", value: "25°C" },
      { timestamp: "12:00", value: "24°C" },
    ],
  },
  {
    id: 2,
    name: "Smart Lock",
    location: "Front Door",
    status: "Online",
    data: [
      { timestamp: "08:30", value: "Locked" },
      { timestamp: "09:15", value: "Unlocked" },
      { timestamp: "09:20", value: "Locked" },
      { timestamp: "11:45", value: "Unlocked" },
      { timestamp: "11:50", value: "Locked" },
    ],
  },
]

export default function UserDashboard() {
  const [userName] = useState("John Doe")
  const [devices] = useState(userDevices)

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader userName={userName} />

      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
            <p className="text-muted-foreground">View and monitor your authorized devices</p>
          </div>
        </div>

        <Tabs defaultValue="devices">
          <TabsList className="mb-4">
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>

            {devices.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">You don't have access to any devices yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent activity for your devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="text-sm font-medium">Today, 12:30 PM</p>
                    <p className="text-sm text-muted-foreground">Temperature Sensor reported 24°C</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm font-medium">Today, 11:50 AM</p>
                    <p className="text-sm text-muted-foreground">Smart Lock status changed to Locked</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm font-medium">Today, 11:45 AM</p>
                    <p className="text-sm text-muted-foreground">Smart Lock status changed to Unlocked</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm font-medium">Today, 10:00 AM</p>
                    <p className="text-sm text-muted-foreground">Temperature Sensor reported 24°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
