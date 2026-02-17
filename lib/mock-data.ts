import type {
  Customer,
  Product,
  ProductImage,
  Order,
  OrderItem,
  OrderEvent,
  OrderWithCustomer,
  ProductWithImages,
} from './types'

// Customers
export const customers: Customer[] = [
  {
    id: '1',
    name: 'María García',
    phone: '+5491155551234',
    email: 'maria.garcia@email.com',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Carlos López',
    phone: '+5491155552345',
    email: 'carlos.lopez@email.com',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    phone: '+5491155553456',
    email: 'ana.martinez@email.com',
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    name: 'Juan Rodríguez',
    phone: '+5491155554567',
    email: 'juan.rodriguez@email.com',
    created_at: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    name: 'Laura Fernández',
    phone: '+5491155555678',
    email: 'laura.fernandez@email.com',
    created_at: '2024-02-15T11:20:00Z',
  },
]

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Camiseta Básica Blanca',
    description: 'Camiseta de algodón 100% de alta calidad. Disponible en varias tallas.',
    price: 2500,
    stock: 45,
    is_published: true,
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Pantalón Jeans Clásico',
    description: 'Jeans de corte clásico, denim resistente y cómodo.',
    price: 8500,
    stock: 30,
    is_published: true,
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Zapatillas Deportivas',
    description: 'Zapatillas livianas ideales para running y uso diario.',
    price: 15000,
    stock: 5,
    is_published: true,
    is_featured: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Campera de Cuero',
    description: 'Campera de cuero sintético, estilo moderno.',
    price: 25000,
    stock: 12,
    is_published: true,
    is_featured: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
  },
  {
    id: '5',
    name: 'Bufanda de Lana',
    description: 'Bufanda tejida a mano, 100% lana merino.',
    price: 4500,
    stock: 3,
    is_published: true,
    is_featured: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Gorra Snapback',
    description: 'Gorra ajustable con diseño urbano.',
    price: 3200,
    stock: 0,
    is_published: false,
    is_featured: false,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
  },
  {
    id: '7',
    name: 'Remera Estampada',
    description: 'Remera con estampado exclusivo, edición limitada.',
    price: 3800,
    stock: 25,
    is_published: true,
    is_featured: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '8',
    name: 'Bermuda de Jean',
    description: 'Bermuda de jean desgastada, perfecta para el verano.',
    price: 6500,
    stock: 18,
    is_published: true,
    is_featured: true,
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
  },
]

// Product Images
export const productImages: ProductImage[] = [
  { id: '1', product_id: '1', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '2', product_id: '1', image_url: '/placeholder.svg?height=200&width=200', is_primary: false, created_at: '2024-01-01T00:00:00Z' },
  { id: '3', product_id: '2', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '4', product_id: '3', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-05T00:00:00Z' },
  { id: '5', product_id: '4', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-10T00:00:00Z' },
  { id: '6', product_id: '5', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-15T00:00:00Z' },
  { id: '7', product_id: '6', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-01-20T00:00:00Z' },
  { id: '8', product_id: '7', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-02-01T00:00:00Z' },
  { id: '9', product_id: '8', image_url: '/placeholder.svg?height=200&width=200', is_primary: true, created_at: '2024-02-05T00:00:00Z' },
]

// Order Items
export const orderItems: OrderItem[] = [
  { id: '1', order_id: '1', product_id: '1', product_name: 'Camiseta Básica Blanca', quantity: 2, unit_price: 2500 },
  { id: '2', order_id: '1', product_id: '2', product_name: 'Pantalón Jeans Clásico', quantity: 1, unit_price: 8500 },
  { id: '3', order_id: '2', product_id: '3', product_name: 'Zapatillas Deportivas', quantity: 1, unit_price: 15000 },
  { id: '4', order_id: '3', product_id: '4', product_name: 'Campera de Cuero', quantity: 1, unit_price: 25000 },
  { id: '5', order_id: '3', product_id: '5', product_name: 'Bufanda de Lana', quantity: 2, unit_price: 4500 },
  { id: '6', order_id: '4', product_id: '1', product_name: 'Camiseta Básica Blanca', quantity: 3, unit_price: 2500 },
  { id: '7', order_id: '5', product_id: '7', product_name: 'Remera Estampada', quantity: 2, unit_price: 3800 },
  { id: '8', order_id: '5', product_id: '8', product_name: 'Bermuda de Jean', quantity: 1, unit_price: 6500 },
  { id: '9', order_id: '6', product_id: '2', product_name: 'Pantalón Jeans Clásico', quantity: 2, unit_price: 8500 },
  { id: '10', order_id: '7', product_id: '1', product_name: 'Camiseta Básica Blanca', quantity: 1, unit_price: 2500 },
  { id: '11', order_id: '7', product_id: '5', product_name: 'Bufanda de Lana', quantity: 1, unit_price: 4500 },
]

// Orders
export const orders: Order[] = [
  {
    id: '1',
    order_number: 'ORD-001',
    customer_id: '1',
    total_amount: 13500,
    payment_status: 'paid',
    order_status: 'shipped',
    notes: 'Cliente frecuente, enviar con regalo.',
    shipping_address: 'Av. Corrientes 1234, CABA, Buenos Aires',
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-02-03T14:00:00Z',
  },
  {
    id: '2',
    order_number: 'ORD-002',
    customer_id: '2',
    total_amount: 15000,
    payment_status: 'paid',
    order_status: 'delivered',
    notes: null,
    shipping_address: 'Calle Florida 567, CABA, Buenos Aires',
    created_at: '2024-02-05T15:45:00Z',
    updated_at: '2024-02-10T11:00:00Z',
  },
  {
    id: '3',
    order_number: 'ORD-003',
    customer_id: '3',
    total_amount: 34000,
    payment_status: 'pending',
    order_status: 'contacted',
    notes: 'Esperando confirmación de dirección.',
    shipping_address: 'San Martín 890, Córdoba, Córdoba',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-10T12:30:00Z',
  },
  {
    id: '4',
    order_number: 'ORD-004',
    customer_id: '4',
    total_amount: 7500,
    payment_status: 'pending',
    order_status: 'new',
    notes: null,
    shipping_address: 'Belgrano 456, Rosario, Santa Fe',
    created_at: '2024-02-12T16:20:00Z',
    updated_at: '2024-02-12T16:20:00Z',
  },
  {
    id: '5',
    order_number: 'ORD-005',
    customer_id: '5',
    total_amount: 14100,
    payment_status: 'paid',
    order_status: 'paid',
    notes: 'Pago confirmado, preparar envío.',
    shipping_address: 'Rivadavia 1111, CABA, Buenos Aires',
    created_at: '2024-02-13T11:15:00Z',
    updated_at: '2024-02-14T09:00:00Z',
  },
  {
    id: '6',
    order_number: 'ORD-006',
    customer_id: '1',
    total_amount: 17000,
    payment_status: 'pending',
    order_status: 'new',
    notes: null,
    shipping_address: 'Av. Corrientes 1234, CABA, Buenos Aires',
    created_at: '2024-02-14T14:00:00Z',
    updated_at: '2024-02-14T14:00:00Z',
  },
  {
    id: '7',
    order_number: 'ORD-007',
    customer_id: '3',
    total_amount: 7000,
    payment_status: 'pending',
    order_status: 'new',
    notes: null,
    shipping_address: 'San Martín 890, Córdoba, Córdoba',
    created_at: '2024-02-15T08:30:00Z',
    updated_at: '2024-02-15T08:30:00Z',
  },
]

// Order Events (Audit Log)
export const orderEvents: OrderEvent[] = [
  { id: '1', order_id: '1', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-01T10:30:00Z', created_by: 'Sistema' },
  { id: '2', order_id: '1', event_type: 'contacted', description: 'Cliente contactado por WhatsApp', created_at: '2024-02-01T11:00:00Z', created_by: 'Admin' },
  { id: '3', order_id: '1', event_type: 'payment_confirmed', description: 'Pago confirmado', created_at: '2024-02-02T10:00:00Z', created_by: 'Admin' },
  { id: '4', order_id: '1', event_type: 'shipped', description: 'Pedido enviado', created_at: '2024-02-03T14:00:00Z', created_by: 'Admin' },
  { id: '5', order_id: '2', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-05T15:45:00Z', created_by: 'Sistema' },
  { id: '6', order_id: '2', event_type: 'payment_confirmed', description: 'Pago confirmado', created_at: '2024-02-06T09:00:00Z', created_by: 'Admin' },
  { id: '7', order_id: '2', event_type: 'shipped', description: 'Pedido enviado', created_at: '2024-02-07T11:00:00Z', created_by: 'Admin' },
  { id: '8', order_id: '2', event_type: 'delivered', description: 'Pedido entregado', created_at: '2024-02-10T11:00:00Z', created_by: 'Admin' },
  { id: '9', order_id: '3', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-10T09:00:00Z', created_by: 'Sistema' },
  { id: '10', order_id: '3', event_type: 'contacted', description: 'Cliente contactado por WhatsApp', created_at: '2024-02-10T12:30:00Z', created_by: 'Admin' },
  { id: '11', order_id: '4', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-12T16:20:00Z', created_by: 'Sistema' },
  { id: '12', order_id: '5', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-13T11:15:00Z', created_by: 'Sistema' },
  { id: '13', order_id: '5', event_type: 'payment_confirmed', description: 'Pago confirmado', created_at: '2024-02-14T09:00:00Z', created_by: 'Admin' },
  { id: '14', order_id: '6', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-14T14:00:00Z', created_by: 'Sistema' },
  { id: '15', order_id: '7', event_type: 'created', description: 'Pedido creado', created_at: '2024-02-15T08:30:00Z', created_by: 'Sistema' },
]

// Helper functions to get data with relations
export function getOrdersWithCustomers(): OrderWithCustomer[] {
  return orders.map((order) => ({
    ...order,
    customer: customers.find((c) => c.id === order.customer_id)!,
    items: orderItems.filter((item) => item.order_id === order.id),
    events: orderEvents.filter((event) => event.order_id === order.id),
  }))
}

export function getProductsWithImages(): ProductWithImages[] {
  return products.map((product) => ({
    ...product,
    images: productImages.filter((img) => img.product_id === product.id),
  }))
}

export function getOrderById(id: string): OrderWithCustomer | undefined {
  const order = orders.find((o) => o.id === id)
  if (!order) return undefined
  return {
    ...order,
    customer: customers.find((c) => c.id === order.customer_id)!,
    items: orderItems.filter((item) => item.order_id === order.id),
    events: orderEvents.filter((event) => event.order_id === order.id),
  }
}

export function getProductById(id: string): ProductWithImages | undefined {
  const product = products.find((p) => p.id === id)
  if (!product) return undefined
  return {
    ...product,
    images: productImages.filter((img) => img.product_id === product.id),
  }
}

// Stats helpers
export function getOrderStats() {
  const ordersWithCustomers = getOrdersWithCustomers()
  return {
    newOrders: ordersWithCustomers.filter((o) => o.order_status === 'new').length,
    pendingPayment: ordersWithCustomers.filter((o) => o.payment_status === 'pending').length,
    pendingShipment: ordersWithCustomers.filter(
      (o) => o.payment_status === 'paid' && !['shipped', 'delivered', 'canceled'].includes(o.order_status)
    ).length,
    totalOrders: ordersWithCustomers.length,
  }
}

export function getLowStockProducts(threshold: number = 10): ProductWithImages[] {
  return getProductsWithImages().filter((p) => p.stock <= threshold && p.stock > 0)
}

export function getOutOfStockProducts(): ProductWithImages[] {
  return getProductsWithImages().filter((p) => p.stock === 0)
}

export function getFeaturedCount(): number {
  return products.filter((p) => p.is_featured).length
}

export const MAX_FEATURED_PRODUCTS = 10
