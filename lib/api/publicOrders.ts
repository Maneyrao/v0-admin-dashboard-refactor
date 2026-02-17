import { apiFetch } from './apiFetch'
import type { Order } from '@/lib/types'

export interface CreateOrderData {
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: {
    product_id: string
    quantity: number
  }[]
}

export const publicOrdersApi = {
  /**
   * POST /public/orders
   */
  async create(data: CreateOrderData): Promise<Order> {
    return apiFetch<Order>('/public/orders', {
      method: 'POST',
      body: data,
      skipAuth: true,
    })
  },
}
