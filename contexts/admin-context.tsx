"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type AdminType = "full" | "billing" | null;

interface AdminContextType {
  adminType: AdminType;
  setAdminType: (type: AdminType) => void;
  isFullAccess: boolean;
  isBillingAccess: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminType, setAdminType] = useState<AdminType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load admin type from localStorage on client side
    const storedType = localStorage.getItem("adminType") as AdminType;
    if (storedType) {
      setAdminType(storedType);
    }
    setIsLoading(false);
  }, []);

  const isFullAccess = adminType === "full";
  const isBillingAccess = adminType === "billing" || adminType === "full";

  return (
    <AdminContext.Provider
      value={{
        adminType,
        setAdminType,
        isFullAccess,
        isBillingAccess,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
