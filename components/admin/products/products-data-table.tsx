'use client'

import { useState } from 'react'
import { Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductWithImages } from '@/lib/types'
import { formatCurrency } from '@/lib/format'
import { ProductDialog } from './product-dialog'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { 
  useUpdateProduct, 
  useDeleteProduct, 
  useSetFeaturedProduct 
} from '@/lib/supabase-services'

const MAX_FEATURED_PRODUCTS = 10

interface ProductsDataTableProps {
  products: ProductWithImages[]
  featuredCount: number
  onProductUpdate: () => void
  isLoading?: boolean
}

export function ProductsDataTable({ 
  products, 
  featuredCount, 
  onProductUpdate,
  isLoading = false 
}: ProductsDataTableProps) {
  const [editingProduct, setEditingProduct] = useState<ProductWithImages | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductWithImages | null>(null)
  const [optimisticProducts, setOptimisticProducts] = useState<Map<string, Partial<ProductWithImages>>>(new Map())
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  const getProductWithOptimistic = (product: ProductWithImages): ProductWithImages => {
    const optimistic = optimisticProducts.get(product.id)
    return optimistic ? { ...product, ...optimistic } : product
  }

  const setLoading = (productId: string, action: string, loading: boolean) => {
    setLoadingActions(prev => {
      const next = new Set(prev)
      const key = `${productId}-${action}`
      if (loading) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }

  const isActionLoading = (productId: string, action: string) => {
    return loadingActions.has(`${productId}-${action}`)
  }

  const deleteProduct = useDeleteProduct()
  const setFeaturedProduct = useSetFeaturedProduct()
  const updateProduct = useUpdateProduct()
  
  const handleDelete = () => {
    if (!deletingProduct) return
    setDeletingProduct(deletingProduct)
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        onProductUpdate()
        setDeletingProduct(null)
      },
      onError: () => {
        setDeletingProduct(null)
      }
    })
  }

  const handleTogglePublished = async (product: ProductWithImages) => {
    const newStatus = !product.is_published
    const productId = product.id
    
    // Optimistic update
    setOptimisticProducts(prev => new Map(prev).set(productId, { is_published: newStatus }))
    setLoading(productId, 'publish', true)

    try {
      // ← AGREGAR LLAMADA REAL A LA BASE DE DATOS
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          status: newStatus ? 'active' : 'paused'
        }
      })
      
      toast.success(newStatus ? 'Producto publicado' : 'Producto oculto')
      onProductUpdate()
    } catch (error) {
      // Revert optimistic update
      setOptimisticProducts(prev => {
        const next = new Map(prev)
        next.delete(productId)
        return next
      })
      
      toast.error('Error al cambiar estado del producto')
      console.error('Toggle published error:', error)
    } finally {
      setLoading(productId, 'publish', false)
    }
  }

  const handleToggleFeatured = async (product: ProductWithImages) => {
    const newStatus = !product.is_featured
    const productId = product.id
    
    // Check limit before making optimistic update
    if (newStatus && featuredCount >= MAX_FEATURED_PRODUCTS) {
      toast.error(`Límite alcanzado: máximo ${MAX_FEATURED_PRODUCTS} productos destacados`)
      return
    }
    
    setFeaturedProduct.mutate(
      { id: productId, featured: newStatus },
      {
        onSuccess: () => {
          onProductUpdate()
        }
      }
    )
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-current" />
            Sin stock
          </Badge>
        </div>
      )
    }
    if (stock <= 5) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="gap-1 bg-orange-500 hover:bg-orange-500/80 text-white">
            <span className="h-2 w-2 rounded-full bg-current" />
            Bajo: {stock}
          </Badge>
          <StockBar stock={stock} maxStock={50} />
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {stock} uds.
        </Badge>
        <StockBar stock={stock} maxStock={50} />
      </div>
    )
  }

  if (isLoading) {
    return <ProductsTableSkeleton />
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((rawProduct) => {
                const product = getProductWithOptimistic(rawProduct)
                const isFeaturedLoading = isActionLoading(product.id, 'featured')
                const isPublishLoading = isActionLoading(product.id, 'publish')

                return (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                            <img
                              src={product.images[0].image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{product.name}</p>
                            {product.is_featured && (
                              <Badge className="gap-1 bg-primary text-primary-foreground shrink-0">
                                <Star className="h-3 w-3 fill-current" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell>
                      {product.is_published ? (
                        <Badge variant="secondary" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <EyeOff className="h-3 w-3" />
                          Oculto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Featured toggle */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleFeatured(rawProduct)}
                              disabled={isFeaturedLoading}
                            >
                              <Star 
                                className={`h-4 w-4 ${
                                  product.is_featured 
                                    ? 'fill-primary text-primary' 
                                    : 'text-muted-foreground hover:text-primary'
                                } ${isFeaturedLoading ? 'animate-pulse' : ''}`} 
                              />
                              <span className="sr-only">
                                {product.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {product.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Publish toggle */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleTogglePublished(rawProduct)}
                              disabled={isPublishLoading}
                            >
                              {product.is_published ? (
                                <EyeOff className={`h-4 w-4 text-muted-foreground ${isPublishLoading ? 'animate-pulse' : ''}`} />
                              ) : (
                                <Eye className={`h-4 w-4 text-muted-foreground ${isPublishLoading ? 'animate-pulse' : ''}`} />
                              )}
                              <span className="sr-only">
                                {product.is_published ? 'Ocultar' : 'Publicar'}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {product.is_published ? 'Ocultar producto' : 'Publicar producto'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingProduct(rawProduct)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar producto</TooltipContent>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingProduct(rawProduct)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar producto</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Product Dialog */}
      <ProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        featuredCount={featuredCount}
        onProductUpdate={onProductUpdate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Eliminar producto"
        description={`¿Estás seguro de eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </TooltipProvider>
  )
}

function StockBar({ stock, maxStock }: { stock: number; maxStock: number }) {
  const percentage = Math.min((stock / maxStock) * 100, 100)
  const color = stock === 0 ? 'bg-destructive' : stock <= 5 ? 'bg-orange-500' : 'bg-green-500'
  
  return (
    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
