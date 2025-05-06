import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Lock, Camera, Droplets } from "lucide-react"

interface DeviceData {
  timestamp: string
  value: string
}

interface Device {
  id: number
  name: string
  location: string
  status: string
  data: DeviceData[]
}

interface DeviceCardProps {
  device: Device
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const getDeviceIcon = () => {
    switch (device.name) {
      case "Temperature Sensor":
        return <Thermometer className="h-5 w-5" />
      case "Smart Lock":
        return <Lock className="h-5 w-5" />
      case "Security Camera":
        return <Camera className="h-5 w-5" />
      case "Humidity Sensor":
        return <Droplets className="h-5 w-5" />
      default:
        return null
    }
  }

  const getLatestData = () => {
    if (device.data && device.data.length > 0) {
      return device.data[device.data.length - 1].value
    }
    return "No data"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">{getDeviceIcon()}</div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <CardDescription>{device.location}</CardDescription>
            </div>
          </div>
          <Badge variant={device.status === "Online" ? "default" : "secondary"}>{device.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="text-2xl font-bold">{getLatestData()}</div>
          <p className="text-xs text-muted-foreground">Last updated: {device.data[device.data.length - 1].timestamp}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Recent History</p>
          <div className="space-y-1">
            {device.data
              .slice()
              .reverse()
              .map((data, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{data.timestamp}</span>
                  <span>{data.value}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
