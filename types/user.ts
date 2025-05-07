export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company: string;
  phone: string;
  notificationEmails: string;
  adminType: "full" | "billing" | null | undefined;
}
