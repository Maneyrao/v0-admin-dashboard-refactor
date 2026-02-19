'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductsDataTable } from '@/components/admin/products/products-data-table'
import { ProductDialog } from '@/components/admin/products/product-dialog'
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useSetFeaturedProduct 
} from '@/lib/supabase-services'
import type { ProductWithImages } from '@/lib/types'

const MAX_FEATURED_PRODUCTS = 10

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch products from API
  const { data: products, isLoading, error, refetch } = useProducts()

  const handleProductUpdate = useCallback(() => {
    refetch()
  }, [refetch])

  const featuredCount = useMemo(() => {
    return products?.filter((p) => p.is_featured).length ?? 0
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (!search) return products

    const searchLower = search.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
    )
  }, [products, search])

  if (error) {
    return (
      <>
        <AdminTopbar title="Productos" />
        <main className="p-4 lg:p-6">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar productos</h3>
            <p className="text-muted-foreground">No se pudieron cargar los productos. Intenta recargar la página.</p>
          </div>
        </main>
      </>
    )
  }

  const isAtLimit = featuredCount >= MAX_FEATURED_PRODUCTS

  return (
    <>
      <AdminTopbar title="Productos" />
      <main className="p-4 lg:p-6 space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Featured counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card">
              <Star className={`h-4 w-4 ${isAtLimit ? 'text-destructive' : 'text-primary fill-primary'}`} />
              <span className="text-sm font-medium">
                Destacados: {featuredCount} / {MAX_FEATURED_PRODUCTS}
              </span>
              {isAtLimit && (
                <Badge variant="destructive" className="text-xs">
                  Límite alcanzado
                </Badge>
              )}
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo producto
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <ProductsDataTable 
          products={filteredProducts} 
          featuredCount={featuredCount}
          onProductUpdate={handleProductUpdate}
          isLoading={isLoading}
        />

        {/* Create Product Dialog */}
        <ProductDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          featuredCount={featuredCount}
          onProductUpdate={handleProductUpdate}
        />
      </main>
    </>
  )
}
