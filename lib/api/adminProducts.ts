import { api, apiGet, apiPost, apiPatch, apiDelete } from '../apiClient'
import type { Product, ProductWithImages } from '@/lib/types'

export interface CreateProductData {
  name: string
  description?: string
  price: number
  stock: number
  status: 'active' | 'paused' // Backend uses 'status' instead of 'is_published'
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  stock?: number
  status?: 'active' | 'paused'
}

export const adminProductsApi = {
  /**
   * GET /admin/products
   */
  async list(): Promise<ProductWithImages[]> {
    return apiGet<ProductWithImages[]>('/admin/products')
  },

  /**
   * POST /admin/products
   */
  async create(data: CreateProductData): Promise<Product> {
    return apiPost<Product>('/admin/products', data)
  },

  /**
   * PATCH /admin/products/{productId}
   */
  async update(productId: string, data: UpdateProductData): Promise<Product> {
    return apiPatch<Product>(`/admin/products/${productId}`, data)
  },

  /**
   * DELETE /admin/products/{productId}
   */
  async remove(productId: string): Promise<void> {
    await apiDelete<void>(`/admin/products/${productId}`)
  },

  /**
   * PATCH /admin/products/{productId}/featured
   */
  async setFeatured(productId: string, featured: boolean): Promise<void> {
    await apiPatch<void>(`/admin/products/${productId}/featured`, { is_featured: featured })
  },
}
