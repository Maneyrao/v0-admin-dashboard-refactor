'use client'

import { useMemo } from 'react'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'
import { useOrders } from '@/lib/supabase-services'
import type { OrderWithCustomer } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

// Mock token helper
const isTokenAvailable = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('access_token')
}

export default function AdminDashboardPage() {
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
