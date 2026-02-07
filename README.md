# Admin dashboard refactor

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tmaneyro-9665s-projects/v0-admin-dashboard-refactor)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/NjVpnmMLoJw)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/tmaneyro-9665s-projects/v0-admin-dashboard-refactor](https://vercel.com/tmaneyro-9665s-projects/v0-admin-dashboard-refactor)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/NjVpnmMLoJw](https://v0.app/chat/NjVpnmMLoJw)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## 📚 Arquitectura de Supabase

### Esquema de Base de Datos

El proyecto utiliza Supabase como backend con las siguientes tablas principales:

```sql
users          -- Gestión de usuarios y roles
products       -- Catálogo de productos  
product_media  -- Imágenes de productos
orders         -- Gestión de pedidos
order_items    -- Detalles de pedidos
```

**Estructura de archivos:**
```
📁 lib/
├── supabase.ts              # Cliente principal y tipos de BD
├── supabase-services.ts     # Hooks de React Query
├── supabase-auth.ts         # API de autenticación cliente
└── supabase-auth-server.ts  # Lógica de autenticación servidor
```

### Sistema de Autenticación

Implementa un sistema de autenticación personalizado (no Supabase Auth):

- **Cookies HTTP-only** para seguridad de sesión
- **Validación de administrador** mediante variables de entorno
- **Función PostgreSQL** `check_password_crypt()` para verificación segura de contraseñas
- **Tokens de sesión** con expiración de 7 días

### Patrón de Servicios

Utiliza React Query (TanStack Query) para gestión de estado y caché:

```typescript
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_media(*)')
      return data?.map(transformProduct) || []
    }
  })
}
```

**Características:**
- Hooks personalizados para cada entidad
- Caché automático (5-10 minutos)
- Actualizaciones optimistas
- Refetch automático en background

## 🏗️ Estructura de Datos

### Tipos del Dominio

El proyecto utiliza un sistema de tipos multi-capa:

```typescript
// Supabase Types (auto-generados)
type SupabaseProduct = Database['public']['Tables']['products']['Row']

// Domain Types (modelos del frontend)
interface ProductWithImages extends Product {
  images: ProductImage[]
}

// Transform Functions
const transformProduct = (product: SupabaseProduct, media: SupabaseProductMedia[]): ProductWithImages
```

### Transformación de Datos

**Flujo de transformación:**
```
Supabase Raw Data → Transform Functions → Domain Types → Component Props
```

**Ejemplo de transformación:**
```typescript
const transformProduct = (product, media) => ({
  id: product.id,
  name: product.name,
  is_published: product.status === 'active', // Transformación de status
  images: media.map(m => ({
    id: m.id,
    image_url: m.url,
    is_primary: m.is_primary
  }))
})
```

### Relaciones y Flujo

**Relaciones principales:**
- `users` ↔ `orders` (un usuario tiene muchos pedidos)
- `products` ↔ `product_media` (un producto tiene muchas imágenes)
- `orders` ↔ `order_items` (un pedido tiene muchos items)
- `products` ↔ `order_items` (un producto aparece en muchos items)

**Flujo de datos:**
```
Component → React Query Hook → Supabase Service → Supabase DB
     ↑              ↓                    ↓              ↓
   UI State    Cached Data    Transformed Data   Raw Data
```

## ⚙️ Configuración

### Variables de Entorno

Variables requeridas en `.env.local`:

```bash
# Supabase Cliente
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Servidor (operaciones de admin)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Configuración de Administración
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

**Nota:** Las variables de servicio (`SUPABASE_*`) se utilizan para operaciones administrativas en el servidor, mientras que las variables públicas (`NEXT_PUBLIC_*`) se usan en el cliente.