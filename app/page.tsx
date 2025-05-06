import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">QSafe Web</h1>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Secure IoT Device Access Management
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage user access to IoT devices with granular control and
              real-time permission updates.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Create and manage user accounts with unique credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Administrators can easily create, edit, and manage user
                  accounts through an intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Define which devices each user can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Grant or restrict access to specific IoT devices for each user
                  with fine-grained permission controls.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Immediately revoke access when needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Changes to access permissions take effect immediately,
                  ensuring security is never compromised.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} QSafe Web. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
