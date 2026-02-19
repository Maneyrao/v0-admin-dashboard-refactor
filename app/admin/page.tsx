'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'
import { useOrders } from '@/lib/supabase-services'
import { useAuth } from '@/components/auth/auth-provider'
import type { OrderWithCustomer } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated, logout } = useAuth()
  
  // Fetch orders from API
  const { data: orders, isLoading, error } = useOrders()

  // Calculate stats from orders
  const stats = useMemo(() => {
    if (!orders) {
      return { newOrders: 0, pendingPayment: 0, pendingShipment: 0 }
    }

    return {
      newOrders: orders.filter((o) => o.order_status === 'new').length,
      pendingPayment: orders.filter((o) => o.payment_status === 'pending').length,
      pendingShipment: orders.filter(
        (o) => o.payment_status === 'paid' && o.order_status !== 'shipped' && o.order_status !== 'delivered'
      ).length,
    }
  }, [orders])

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    router.replace('/admin/login')
    return null
  }

  if (loading) {
    return (
      <>
        <AdminTopbar title="Dashboard" />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-center h-64">
            <Skeleton className="h-8 w-32" />
          </div>
        </main>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Dashboard" />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </main>
      </>
    )
  }

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <main className="p-4 lg:p-6 space-y-6">
        <KPICards stats={stats} />
        <RecentOrdersTable orders={orders || []} />
      </main>
    </>
  )
}
