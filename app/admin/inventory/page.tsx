'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { Search, AlertTriangle } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryDataTable } from '@/components/admin/inventory/inventory-data-table'
import { adminProductsApi } from '@/lib/api/adminProducts'
import type { ProductWithImages } from '@/lib/types'

export default function InventoryPage() {
  const [search, setSearch] = useState('')

  // Fetch products from API
  const { data: products, isLoading, mutate } = useSWR<ProductWithImages[]>(
    '/admin/products',
    () => adminProductsApi.list()
  )

  const handleProductUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  // Calculate stock stats
  const { lowStockProducts, outOfStockProducts, filteredProducts } = useMemo(() => {
    if (!products) {
      return { lowStockProducts: [], outOfStockProducts: [], filteredProducts: [] }
    }

    const outOfStock = products.filter((p) => p.stock === 0)
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5)

    let filtered = products
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort by stock (lowest first)
    filtered = [...filtered].sort((a, b) => a.stock - b.stock)

    return { lowStockProducts: lowStock, outOfStockProducts: outOfStock, filteredProducts: filtered }
  }, [products, search])

  if (isLoading) {
    return (
      <>
        <AdminTopbar title="Inventario" />
        <main className="p-4 lg:p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </main>
      </>
    )
  }

  return (
    <>
      <AdminTopbar title="Inventario" />
      <main className="p-4 lg:p-6 space-y-6">
        {/* Alert Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={outOfStockProducts.length > 0 ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sin stock
              </CardTitle>
              <AlertTriangle className={`h-5 w-5 ${outOfStockProducts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${outOfStockProducts.length > 0 ? 'text-destructive' : ''}`}>
                {outOfStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {outOfStockProducts.length === 1 ? 'producto agotado' : 'productos agotados'}
              </p>
            </CardContent>
          </Card>

          <Card className={lowStockProducts.length > 0 ? 'border-primary/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock bajo
              </CardTitle>
              <AlertTriangle className={`h-5 w-5 ${lowStockProducts.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${lowStockProducts.length > 0 ? 'text-primary' : ''}`}>
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lowStockProducts.length === 1 ? 'producto con menos de 6 unidades' : 'productos con menos de 6 unidades'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Inventory Table */}
        <InventoryDataTable 
          products={filteredProducts} 
          onProductUpdate={handleProductUpdate}
        />
      </main>
    </>
  )
}
