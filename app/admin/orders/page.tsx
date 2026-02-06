'use client'

import { useState, useMemo, useCallback } from 'react'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { OrdersFilters } from '@/components/admin/orders/orders-filters'
import { OrdersDataTable } from '@/components/admin/orders/orders-data-table'
import { 
  useOrders, 
  useMarkOrderAsPaid, 
  useMarkOrderAsShipped 
} from '@/lib/supabase-services'
import type { PaymentStatus, OrderStatus, OrderWithCustomer } from '@/lib/types'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'all'>('all')
  const [orderStatus, setOrderStatus] = useState<OrderStatus | 'all'>('all')

  // Fetch orders from API
  const { data: orders, isLoading, error, refetch } = useOrders()

  const handleOrderUpdate = useCallback(() => {
    refetch()
  }, [refetch])

  if (error) {
    return (
      <>
        <AdminTopbar title="Pedidos" />
        <main className="p-4 lg:p-6">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar pedidos</h3>
            <p className="text-muted-foreground">No se pudieron cargar los pedidos. Intenta recargar la página.</p>
          </div>
        </main>
      </>
    )
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []

    return orders.filter((order) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          order.order_number.toLowerCase().includes(searchLower) ||
          order.customer.name.toLowerCase().includes(searchLower) ||
          order.customer.email.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Payment status filter
      if (paymentStatus !== 'all' && order.payment_status !== paymentStatus) {
        return false
      }

      // Order status filter
      if (orderStatus !== 'all' && order.order_status !== orderStatus) {
        return false
      }

      return true
    })
  }, [orders, search, paymentStatus, orderStatus])

  const handleReset = () => {
    setSearch('')
    setPaymentStatus('all')
    setOrderStatus('all')
  }

  return (
    <>
      <AdminTopbar title="Pedidos" />
      <main className="p-4 lg:p-6 space-y-6">
        <OrdersFilters
          search={search}
          onSearchChange={setSearch}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={setPaymentStatus}
          orderStatus={orderStatus}
          onOrderStatusChange={setOrderStatus}
          onReset={handleReset}
        />
        <OrdersDataTable 
          orders={filteredOrders} 
          onOrderUpdate={handleOrderUpdate}
          isLoading={isLoading}
        />
      </main>
    </>
  )
}
