// Database-aligned types for Supabase schema

export type PaymentStatus = 'pending' | 'paid'

export type OrderStatus = 'new' | 'contacted' | 'paid' | 'shipped' | 'delivered' | 'canceled'

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string // snapshot
  quantity: number
  unit_price: number
  subtotal: number // Added for backend compatibility
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  customer?: Customer
  total_amount: number
  payment_status: PaymentStatus
  order_status: OrderStatus
  notes: string | null
  shipping_address: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderEvent {
  id: string
  order_id: string
  event_type: string
  description: string
  created_at: string
  created_by: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  quantity_change: number
  reason: string
  created_at: string
  created_by: string
}

// Extended types for UI
export interface OrderWithCustomer extends Order {
  customer: Customer
  items: OrderItem[]
  events?: OrderEvent[]
}

export interface ProductWithImages extends Product {
  images: ProductImage[]
}
