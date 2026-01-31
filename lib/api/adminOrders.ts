import { api, apiGet, apiPatch } from '../apiClient'
import type { OrderWithCustomer } from '@/lib/types'

export const adminOrdersApi = {
  /**
   * GET /admin/orders
   */
  async list(): Promise<OrderWithCustomer[]> {
    return apiGet<OrderWithCustomer[]>('/admin/orders')
  },

  /**
   * GET /admin/orders/{orderId}
   */
  async detail(orderId: string): Promise<OrderWithCustomer> {
    return apiGet<OrderWithCustomer>(`/admin/orders/${orderId}`)
  },

  /**
   * PATCH /admin/orders/{orderId}/mark-paid
   */
  async markPaid(orderId: string): Promise<void> {
    await apiPatch<void>(`/admin/orders/${orderId}/mark-paid`)
  },

  /**
   * PATCH /admin/orders/{orderId}/mark-shipped
   */
  async markShipped(orderId: string): Promise<void> {
    await apiPatch<void>(`/admin/orders/${orderId}/mark-shipped`)
  },
}
