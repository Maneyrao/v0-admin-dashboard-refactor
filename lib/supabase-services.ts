import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import apiClient, { handleApiError } from './api-client'
import type { Product, ProductWithImages, ProductImage, OrderWithCustomer, OrderItem, OrderStatus, PaymentStatus } from '@/lib/types'
import { toast } from 'sonner'

// Types for Supabase compatibility
type SupabaseProduct = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  status: 'active' | 'paused'
  is_featured: boolean
  featured_at: string | null
  created_at: string
}

type SupabaseProductMedia = {
  id: string
  product_id: string
  type: string
  url: string
  is_primary: boolean
  order: number
  created_at: string
}

type CreateProductData = {
  name: string
  description?: string
  price: number
  stock: number
  status: 'active' | 'paused'
}

type UpdateProductData = {
  name?: string
  description?: string
  price?: number
  stock?: number
  status?: 'active' | 'paused'
}

// Transform Supabase product to frontend product
const transformProduct = (product: SupabaseProduct, media: SupabaseProductMedia[] = []): ProductWithImages => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  is_published: product.status === 'active',
  is_featured: product.is_featured || false,
  created_at: product.created_at,
  updated_at: null,
  images: media.map(m => ({
    id: m.id,
    product_id: m.product_id,
    image_url: m.url,
    is_primary: m.is_primary,
    type: m.type,
    order: m.order,
    created_at: m.created_at
  }))
})

// Products Query Hook
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductWithImages[]> => {
      // Keep using Supabase directly for now - backend integration can be enabled later
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, is_primary, type, order)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching products:', error)
        throw new Error('Error al cargar productos')
      }
      
      return products?.map(product => 
        transformProduct(product, product.product_media)
      ) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Single Product Query Hook
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<ProductWithImages | null> => {
      /*AQUI CONECTAR*/
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, is_primary, type, order, created_at)
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching product:', error)
        throw new Error('Error al cargar producto')
      }
      
      if (!product) return null
      
      return transformProduct(product, product.product_media)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Create Product Mutation Hook
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProductData): Promise<ProductWithImages> => {
      /*AQUI CONECTAR*/
      const { data: product, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating product:', error)
        throw new Error('Error al crear producto')
      }
      
      return transformProduct(product, [])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear producto')
      console.error('Create product error:', error)
    }
  })
}

// Update Product Mutation Hook
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductData }): Promise<ProductWithImages> => {
      /*AQUI CONECTAR*/
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single()
       
      if (error) {
        console.error('Error updating product:', error)
        throw new Error('Error al actualizar producto')
      }
       
      // Get media for complete product
      /*AQUI CONECTAR*/
      const { data: media } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', id)
        .order('order', { ascending: true })
      
      return transformProduct(product, media || [])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto actualizado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar producto')
      console.error('Update product error:', error)
    }
  })
}

// Delete Product Mutation Hook
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      /*AQUI CONECTAR*/
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting product:', error)
        throw new Error('Error al eliminar producto')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al eliminar producto')
      console.error('Delete product error:', error)
    }
  })
}

// Update Stock Mutation Hook
export const useUpdateStock = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }): Promise<ProductWithImages> => {
      /*AQUI CONECTAR*/
      const { data: product, error } = await supabase
        .from('products')
        .update({ stock })
        .eq('id', id)
        .select()
        .single()
       
      if (error) {
        console.error('Error updating stock:', error)
        throw new Error('Error al actualizar stock')
      }
       
      // Get media for complete product
      /*AQUI CONECTAR*/
      const { data: media } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', id)
        .order('order', { ascending: true })
      
      return transformProduct(product, media || [])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Stock actualizado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar stock')
      console.error('Update stock error:', error)
    }
  })
}

// Set Featured Product Mutation Hook (placeholder for now)
export const useSetFeaturedProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }): Promise<void> => {
      const updateData = featured 
        ? { is_featured: true, featured_at: new Date().toISOString() }
        : { is_featured: false, featured_at: null }
      
      /*AQUI CONECTAR*/
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
      
      if (error) {
        console.error('Error setting featured product:', error)
        throw new Error('Error al actualizar producto destacado')
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      if (variables.featured) {
        toast.success('Producto marcado como destacado')
      } else {
        toast.success('Producto ya no está destacado')
      }
    },
    onError: (error) => {
      if (error instanceof Error && error.message.includes('límite')) {
        toast.error('Límite de productos destacados alcanzado')
      } else {
        toast.error('Error al actualizar producto')
      }
      console.error('Set featured error:', error)
    }
  })
}

// Types for Supabase orders compatibility
type SupabaseOrder = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  notes: string | null
  total_amount: number
  payment_method: string
  current_status: string
  created_at: string
}

type SupabaseOrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

// Transform Supabase order to frontend order
const transformOrder = (order: SupabaseOrder, items: SupabaseOrderItem[] = []): OrderWithCustomer => {
  const paymentStatus: PaymentStatus = order.payment_method === 'paid' ? 'paid' : 'pending'
  const orderStatus: OrderStatus = 
    order.current_status === 'new' ? 'new' :
    order.current_status === 'contacted' ? 'contacted' :
    order.current_status === 'paid' ? 'paid' :
    order.current_status === 'shipped' ? 'shipped' :
    order.current_status === 'delivered' ? 'delivered' :
    'new'

  return {
    id: order.id,
    order_number: `ORD-${order.id.slice(0, 8)}`,
    customer_id: order.id,
    customer: {
      id: order.id,
      name: order.customer_name,
      email: order.customer_email || '',
      phone: order.customer_phone,
      created_at: order.created_at
    },
    total_amount: order.total_amount,
    payment_status: paymentStatus,
    order_status: orderStatus,
    notes: order.notes,
    shipping_address: null, // TODO: Add shipping address to schema
    created_at: order.created_at,
    updated_at: order.created_at,
    items: items.map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price
    }))
  }
}

// Orders Query Hook
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<OrderWithCustomer[]> => {
      // TEMPORARY: Use Supabase for orders to ensure UI works
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(id, product_id, product_name, quantity, unit_price)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching orders:', error)
        throw new Error('Error al cargar pedidos')
      }
      
      return orders?.map(order => 
        transformOrder(order, order.order_items || [])
      ) || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Single Order Query Hook
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async (): Promise<OrderWithCustomer | null> => {
      // Use backend API for order details
      const response = await apiClient.get(`/admin/orders/${id}`)
      
      if (response.error) {
        console.error('Error fetching order:', response.error)
        throw new Error(handleApiError(response))
      }
      
      const backendOrder = response.data
      
      if (!backendOrder) return null
      
      // Transform backend order to frontend format
      const supabaseOrder: SupabaseOrder = {
        id: backendOrder.id,
        customer_name: backendOrder.customer_name,
        customer_phone: backendOrder.customer_phone,
        customer_email: backendOrder.customer_email,
        notes: backendOrder.notes,
        total_amount: backendOrder.total_amount,
        payment_method: backendOrder.payment_method,
        current_status: backendOrder.current_status,
        created_at: backendOrder.created_at
      }
      
      return transformOrder(supabaseOrder, []) // Empty items array for now
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

// Mark Order as Paid Mutation Hook
export const useMarkOrderAsPaid = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Use backend API for marking paid
      const response = await apiClient.patch(`/admin/orders/${id}/mark-paid`)
      
      if (response.error) {
        console.error('Error marking order as paid:', response.error)
        throw new Error(handleApiError(response))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido marcado como pagado')
    },
    onError: (error) => {
      toast.error('Error al marcar como pagado')
      console.error('Mark paid error:', error)
    }
  })
}

// Mark Order as Shipped Mutation Hook
export const useMarkOrderAsShipped = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Use backend API for marking shipped
      const response = await apiClient.patch(`/admin/orders/${id}/mark-shipped`)
      
      if (response.error) {
        console.error('Error marking order as shipped:', response.error)
        throw new Error(handleApiError(response))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido marcado como enviado')
    },
    onError: (error) => {
      toast.error('Error al marcar como enviado')
      console.error('Mark shipped error:', error)
    }
  })
}