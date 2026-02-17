'use client'

import React from "react"
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { Toaster } from '@/components/ui/sonner'
import { ROUTE_ADMIN_LOGIN } from '@/lib/routes'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Login page should not be protected
  if (pathname === ROUTE_ADMIN_LOGIN) {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-64">{children}</div>
        <Toaster />
      </div>
    </AdminGuard>
  )
}
