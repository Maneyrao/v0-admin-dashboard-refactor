'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'
import { adminOrdersApi } from '@/lib/api/adminOrders'
import type { OrderWithCustomer } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardPage() {
  // Fetch orders from API
  const { data: orders, isLoading, error } = useSWR<OrderWithCustomer[]>(
    '/admin/orders',
    () => adminOrdersApi.list(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onError: (err) => {
        console.error('Failed to fetch dashboard data:', err)
      }
    }
  )

  if (error) {
    return (
      <>
        <AdminTopbar title="Dashboard" />
        <main className="p-4 lg:p-6">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar dashboard</h3>
            <p className="text-muted-foreground">No se pudieron cargar los datos. Intenta recargar la página.</p>
          </div>
        </main>
      </>
    )
  }

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
