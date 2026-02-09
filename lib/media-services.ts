// Media Upload Hook for Backend Integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { handleApiError } from './api-client'
import { toast } from 'sonner'

interface UploadMediaData {
  file: File
  type: 'image' | 'video'
  is_primary?: boolean
  order?: number
}

interface MediaUploadResult {
  id: string
  path: string
  public_url: string
  type: string
  is_primary: boolean
  order: number
  created_at: string
}

// Upload Media Mutation Hook
export const useUploadMedia = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: UploadMediaData }): Promise<MediaUploadResult> => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('type', data.type)
      formData.append('is_primary', String(data.is_primary || false))
      formData.append('order', String(data.order || 0))
      
      // Connect to backend API for upload
      const response = await apiClient.upload(`/admin/products/${productId}/media/upload`, formData)
      
      if (response.error) {
        console.error('Error uploading media:', response.error)
        throw new Error(handleApiError(response))
      }
      
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Archivo subido exitosamente')
    },
    onError: (error) => {
      toast.error('Error al subir archivo')
      console.error('Upload media error:', error)
    }
  })
}

// List Media Query Hook
export const useProductMedia = (productId: string) => {
  return useQuery({
    queryKey: ['product-media', productId],
    queryFn: async (): Promise<MediaUploadResult[]> => {
      // Connect to backend API
      const response = await apiClient.get(`/admin/products/${productId}/media`)
      
      if (response.error) {
        console.error('Error fetching product media:', response.error)
        throw new Error(handleApiError(response))
      }
      
      return response.data || []
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Update Media Mutation Hook
export const useUpdateMedia = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, mediaId, data }: { 
      productId: string
      mediaId: string
      data: { is_primary?: boolean; order?: number }
    }): Promise<MediaUploadResult> => {
      // Connect to backend API
      const response = await apiClient.patch(`/admin/products/${productId}/media/${mediaId}`, data)
      
      if (response.error) {
        console.error('Error updating media:', response.error)
        throw new Error(handleApiError(response))
      }
      
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      toast.success('Media actualizada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar media')
      console.error('Update media error:', error)
    }
  })
}

// Set Primary Media Mutation Hook
export const useSetPrimaryMedia = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, mediaId }: { productId: string; mediaId: string }): Promise<void> => {
      // Connect to backend API
      const response = await apiClient.patch(`/admin/products/${productId}/media/${mediaId}/primary`)
      
      if (response.error) {
        console.error('Error setting primary media:', response.error)
        throw new Error(handleApiError(response))
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      toast.success('Imagen principal establecida')
    },
    onError: (error) => {
      toast.error('Error al establecer imagen principal')
      console.error('Set primary media error:', error)
    }
  })
}

// Delete Media Mutation Hook
export const useDeleteMedia = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ productId, mediaId }: { productId: string; mediaId: string }): Promise<void> => {
      // Connect to backend API
      const response = await apiClient.delete(`/admin/products/${productId}/media/${mediaId}`)
      
      if (response.error) {
        console.error('Error deleting media:', response.error)
        throw new Error(handleApiError(response))
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-media', variables.productId] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] })
      toast.success('Archivo eliminado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al eliminar archivo')
      console.error('Delete media error:', error)
    }
  })
}