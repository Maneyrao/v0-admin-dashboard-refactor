import { api, apiGet, apiPost, apiPatch, apiDelete } from '../apiClient'
import type { ProductImage } from '@/lib/types'

export interface LinkMediaPayload {
  image_url: string
  is_primary?: boolean
}

export interface UpdateMediaData {
  is_primary?: boolean
}

export const adminMediaApi = {
  /**
   * GET /admin/products/{productId}/media
   */
  async list(productId: string): Promise<ProductImage[]> {
    return apiGet<ProductImage[]>(`/admin/products/${productId}/media`)
  },

  /**
   * POST /admin/products/{productId}/media/link
   */
  async link(productId: string, payload: LinkMediaPayload): Promise<ProductImage> {
    return apiPost<ProductImage>(`/admin/products/${productId}/media/link`, payload)
  },

  /**
   * POST /admin/products/{productId}/media/upload
   */
  async upload(productId: string, file: File): Promise<ProductImage> {
    const formData = new FormData()
    formData.append('file', file)

    return api<ProductImage>(`/admin/products/${productId}/media/upload`, {
      method: 'POST',
      body: formData,
    })
  },

  /**
   * PATCH /admin/products/{productId}/media/{mediaId}
   */
  async update(productId: string, mediaId: string, data: UpdateMediaData): Promise<ProductImage> {
    return apiPatch<ProductImage>(`/admin/products/${productId}/media/${mediaId}`, data)
  },

  /**
   * PATCH /admin/products/{productId}/media/{mediaId}/primary
   */
  async setPrimary(productId: string, mediaId: string): Promise<void> {
    await apiPatch<void>(`/admin/products/${productId}/media/${mediaId}/primary`)
  },

  /**
   * DELETE /admin/products/{productId}/media/{mediaId}
   */
  async remove(productId: string, mediaId: string): Promise<void> {
    await apiDelete<void>(`/admin/products/${productId}/media/${mediaId}`)
  },
}
