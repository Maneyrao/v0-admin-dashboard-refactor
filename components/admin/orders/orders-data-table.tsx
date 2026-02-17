'use client'

import { useState } from 'react'
import { MessageCircle, MoreHorizontal, CreditCard, Truck, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderWithCustomer } from '@/lib/types'
import { formatCurrency, formatDate, getWhatsAppLink } from '@/lib/format'
import { PaymentStatusBadge, OrderStatusBadge } from './status-badges'
import { OrderSheet } from './order-sheet'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { adminOrdersApi } from '@/lib/api/adminOrders'
import { ApiError } from '@/lib/apiClient'

interface OrdersDataTableProps {
  orders: OrderWithCustomer[]
  onOrderUpdate?: () => void
  isLoading?: boolean
}

export function OrdersDataTable({ orders, onOrderUpdate, isLoading = false }: OrdersDataTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'paid' | 'shipped' | null
    order: OrderWithCustomer | null
    loading: boolean
  }>({ type: null, order: null, loading: false })

  const handleMarkAsPaid = (order: OrderWithCustomer) => {
    setConfirmAction({ type: 'paid', order, loading: false })
  }

  const handleMarkAsShipped = (order: OrderWithCustomer) => {
    if (order.payment_status !== 'paid') {
      toast.error('No se puede enviar un pedido sin pago confirmado')
      return
    }
    setConfirmAction({ type: 'shipped', order, loading: false })
  }

  const confirmMarkAsPaid = async () => {
    if (!confirmAction.order) return
    
    setConfirmAction(prev => ({ ...prev, loading: true }))
    
    try {
      await adminOrdersApi.markPaid(confirmAction.order.id)
      toast.success(`Pedido ${confirmAction.order.order_number} marcado como pagado`)
      onOrderUpdate?.()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Error al marcar como pagado')
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setConfirmAction({ type: null, order: null, loading: false })
    }
  }

  const confirmMarkAsShipped = async () => {
    if (!confirmAction.order) return
    
    setConfirmAction(prev => ({ ...prev, loading: true }))
    
    try {
      await adminOrdersApi.markShipped(confirmAction.order.id)
      toast.success(`Pedido ${confirmAction.order.order_number} marcado como enviado`)
      onOrderUpdate?.()
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Error al marcar como enviado')
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setConfirmAction({ type: null, order: null, loading: false })
    }
  }

  if (isLoading) {
    return <OrdersTableSkeleton />
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron pedidos
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.order_status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="h-8"
                      >
                        <a
                          href={getWhatsAppLink(
                            order.customer.phone,
                            order.customer.name,
                            order.order_number,
                            order.total_amount
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </a>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Más acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleMarkAsPaid(order)}
                            disabled={order.payment_status === 'paid'}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Marcar como pagado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMarkAsShipped(order)}
                            disabled={order.payment_status !== 'paid' || order.order_status === 'shipped' || order.order_status === 'delivered'}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Marcar como enviado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Sheet */}
      <OrderSheet
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onMarkAsPaid={handleMarkAsPaid}
        onMarkAsShipped={handleMarkAsShipped}
        onOrderUpdate={onOrderUpdate}
      />

      {/* Confirm Mark as Paid */}
      <ConfirmDialog
        open={confirmAction.type === 'paid'}
        onOpenChange={(open) => !open && setConfirmAction({ type: null, order: null, loading: false })}
        title="Confirmar pago"
        description={`¿Estás seguro de marcar el pedido ${confirmAction.order?.order_number} como pagado? Esta acción reducirá el stock de los productos.`}
        confirmLabel={confirmAction.loading ? 'Procesando...' : 'Marcar como pagado'}
        onConfirm={confirmMarkAsPaid}
        loading={confirmAction.loading}
      />

      {/* Confirm Mark as Shipped */}
      <ConfirmDialog
        open={confirmAction.type === 'shipped'}
        onOpenChange={(open) => !open && setConfirmAction({ type: null, order: null, loading: false })}
        title="Confirmar envío"
        description={`¿Estás seguro de marcar el pedido ${confirmAction.order?.order_number} como enviado?`}
        confirmLabel={confirmAction.loading ? 'Procesando...' : 'Marcar como enviado'}
        onConfirm={confirmMarkAsShipped}
        loading={confirmAction.loading}
      />
    </>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
