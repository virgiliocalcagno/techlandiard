"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Extract locale from pathname (/{locale}/admin/...)
      const locale = pathname.split("/")[1] || "es";
      router.replace(`/${locale}/login`);
    }
  }, [user, loading, router, pathname]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#c1fffe] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#767575] uppercase tracking-widest">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  return <>{children}</>;
}
