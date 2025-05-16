import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface UnauthorizedAccessProps {
  message?: string
}

export default function UnauthorizedAccess({ message }: UnauthorizedAccessProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Unauthorized Access</CardTitle>
          </div>
          <CardDescription>You do not have permission to access this resource.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {message || "Your current role does not have the necessary permissions to view this page."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login with Different Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
