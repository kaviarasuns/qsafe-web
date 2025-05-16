"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Bell, Filter, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format, isBefore, addMonths, parseISO } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: number
  name: string
  email: string
  role: string
  company?: string
  phone?: string
}

interface ServiceReminder {
  id: string
  userId: number
  serviceType: string
  siteLocation: string
  lastServiceDate: string
  dueDate: string
  reminderEnabled: boolean
  reminderMonths: number
}

interface ServiceReminderProps {
  users: User[]
  serviceReminders: ServiceReminder[]
  onUpdateReminder: (id: string, data: Partial<ServiceReminder>) => void
}

export default function ServiceReminderComponent({ users, serviceReminders, onUpdateReminder }: ServiceReminderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<ServiceReminder | null>(null)
  const [reminderMonths, setReminderMonths] = useState<number>(1)
  const [reminderEnabled, setReminderEnabled] = useState(true)

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  const openEditDialog = (reminder: ServiceReminder) => {
    setSelectedReminder(reminder)
    setReminderMonths(reminder.reminderMonths)
    setReminderEnabled(reminder.reminderEnabled)
    setIsEditDialogOpen(true)
  }

  const handleSaveReminder = () => {
    if (selectedReminder) {
      onUpdateReminder(selectedReminder.id, {
        reminderMonths,
        reminderEnabled,
        dueDate: format(addMonths(parseISO(selectedReminder.lastServiceDate), reminderMonths), "yyyy-MM-dd"),
      })
      setIsEditDialogOpen(false)
    }
  }

  // Filter reminders based on search term and active filters
  const filteredReminders = serviceReminders.filter((reminder) => {
    // Get user
    const user = users.find((u) => u.id === reminder.userId)
    if (!user) return false

    // Search filter
    const searchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reminder.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.siteLocation.toLowerCase().includes(searchTerm.toLowerCase())

    // If no active filters, just use search
    if (activeFilters.length === 0) return searchMatch

    // Apply active filters
    const isOverdue = isBefore(new Date(reminder.dueDate), new Date())
    const isDueSoon = !isOverdue && isBefore(new Date(reminder.dueDate), addMonths(new Date(), 1))

    return (
      searchMatch &&
      (activeFilters.includes("overdue") ? isOverdue : true) &&
      (activeFilters.includes("due-soon") ? isDueSoon : true) &&
      (activeFilters.includes("enabled") ? reminder.reminderEnabled : true) &&
      (activeFilters.includes("disabled") ? !reminder.reminderEnabled : true)
    )
  })

  // Count reminders by status
  const overdueCount = serviceReminders.filter((reminder) => isBefore(new Date(reminder.dueDate), new Date())).length

  const dueSoonCount = serviceReminders.filter(
    (reminder) =>
      !isBefore(new Date(reminder.dueDate), new Date()) &&
      isBefore(new Date(reminder.dueDate), addMonths(new Date(), 1)),
  ).length

  const enabledCount = serviceReminders.filter((reminder) => reminder.reminderEnabled).length

  return (
    <>
      <div className="grid gap-4 mb-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceReminders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Within 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{dueSoonCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Schedule soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{enabledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{serviceReminders.length - enabledCount} disabled</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex flex-1 gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
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
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <h4 className="font-medium">Service Filters</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-overdue"
                      checked={activeFilters.includes("overdue")}
                      onCheckedChange={() => toggleFilter("overdue")}
                    />
                    <Label htmlFor="filter-overdue">Overdue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-due-soon"
                      checked={activeFilters.includes("due-soon")}
                      onCheckedChange={() => toggleFilter("due-soon")}
                    />
                    <Label htmlFor="filter-due-soon">Due Soon (30 days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-enabled"
                      checked={activeFilters.includes("enabled")}
                      onCheckedChange={() => toggleFilter("enabled")}
                    />
                    <Label htmlFor="filter-enabled">Reminders Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-disabled"
                      checked={activeFilters.includes("disabled")}
                      onCheckedChange={() => toggleFilter("disabled")}
                    />
                    <Label htmlFor="filter-disabled">Reminders Disabled</Label>
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

          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Reminder</CardTitle>
          <CardDescription>Track and manage service schedules for sites.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Site Location</TableHead>
                <TableHead>Last Service Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.map((reminder) => {
                const user = users.find((u) => u.id === reminder.userId)
                if (!user) return null

                const isOverdue = isBefore(new Date(reminder.dueDate), new Date())
                const isDueSoon = !isOverdue && isBefore(new Date(reminder.dueDate), addMonths(new Date(), 1))

                return (
                  <TableRow key={reminder.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.company || "N/A"}</TableCell>
                    <TableCell>{reminder.serviceType}</TableCell>
                    <TableCell>{reminder.siteLocation}</TableCell>
                    <TableCell>{reminder.lastServiceDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {reminder.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={reminder.reminderEnabled ? "default" : "secondary"}>
                          {reminder.reminderMonths} {reminder.reminderMonths === 1 ? "month" : "months"}
                        </Badge>
                        <Badge variant={reminder.reminderEnabled ? "outline" : "secondary"}>
                          {reminder.reminderEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : isDueSoon ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600">
                          Due Soon
                        </Badge>
                      ) : (
                        <Badge variant="outline">Up to Date</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(reminder)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredReminders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    No service reminders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Reminder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Service Reminder</DialogTitle>
            <DialogDescription>Modify the reminder settings for this service.</DialogDescription>
          </DialogHeader>

          {selectedReminder && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reminderMonths">Reminder Frequency (Months)</Label>
                <Select
                  value={reminderMonths.toString()}
                  onValueChange={(value) => setReminderMonths(Number.parseInt(value))}
                >
                  <SelectTrigger id="reminderMonths">
                    <SelectValue placeholder="Select months" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 9, 12, 18, 24].map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {month} {month === 1 ? "month" : "months"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customMonths">Custom Months</Label>
                <Input
                  id="customMonths"
                  type="number"
                  min="1"
                  max="60"
                  value={reminderMonths}
                  onChange={(e) => setReminderMonths(Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminderEnabled">Enable Reminder</Label>
                <Switch id="reminderEnabled" checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
              </div>

              <div className="grid gap-2">
                <Label>Next Due Date</Label>
                <div className="text-sm">
                  {format(addMonths(parseISO(selectedReminder.lastServiceDate), reminderMonths), "MMMM d, yyyy")}
                  <span className="text-muted-foreground ml-2">
                    ({reminderMonths} {reminderMonths === 1 ? "month" : "months"} after last service)
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReminder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
