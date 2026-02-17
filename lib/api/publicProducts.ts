import { apiFetch } from './apiFetch'
import type { ProductWithImages } from '@/lib/types'

export const publicProductsApi = {
  /**
   * GET /public/products
   */
  async list(): Promise<ProductWithImages[]> {
    return apiFetch<ProductWithImages[]>('/public/products', { skipAuth: true })
  },

  /**
   * GET /public/products/{productId}
   */
  async detail(productId: string): Promise<ProductWithImages> {
    return apiFetch<ProductWithImages>(`/public/products/${productId}`, { skipAuth: true })
  },
}
