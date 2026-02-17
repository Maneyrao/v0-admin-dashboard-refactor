'use client'

import { useState } from 'react'
import { AlertTriangle, Package, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductWithImages } from '@/lib/types'
import { formatCurrency } from '@/lib/format'
import { StockAdjustmentDialog } from './stock-adjustment-dialog'

interface InventoryDataTableProps {
  products: ProductWithImages[]
  onProductUpdate?: () => void
}

export function InventoryDataTable({ products, onProductUpdate }: InventoryDataTableProps) {
  const [adjustingProduct, setAdjustingProduct] = useState<ProductWithImages | null>(null)

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        badge: <Badge variant="destructive">Sin stock</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
        alert: true,
      }
    }
    if (stock <= 5) {
      return {
        badge: <Badge className="bg-primary text-primary-foreground">Stock bajo</Badge>,
        icon: <AlertTriangle className="h-4 w-4 text-primary" />,
        alert: true,
      }
    }
    if (stock <= 10) {
      return {
        badge: <Badge variant="secondary">Stock moderado</Badge>,
        icon: null,
        alert: false,
      }
    }
    return {
      badge: <Badge variant="outline">Stock OK</Badge>,
      icon: null,
      alert: false,
    }
  }

  // Sort products by stock (lowest first)
  const sortedProducts = [...products].sort((a, b) => a.stock - b.stock)

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Stock actual</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <TableRow
                    key={product.id}
                    className={stockStatus.alert ? 'bg-muted/30' : ''}
                  >
                    <TableCell>
                      {stockStatus.icon}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                            <img
                              src={product.images[0].image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {!product.is_published && (
                            <p className="text-xs text-muted-foreground">No publicado</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-lg font-bold ${product.stock === 0 ? 'text-destructive' : product.stock <= 5 ? 'text-primary' : ''}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {stockStatus.badge}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => setAdjustingProduct(product)}
                          title="Ajustar stock"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => setAdjustingProduct(product)}
                          disabled={product.stock === 0}
                          title="Reducir stock"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        product={adjustingProduct}
        open={!!adjustingProduct}
        onOpenChange={(open) => !open && setAdjustingProduct(null)}
        onProductUpdate={onProductUpdate}
      />
    </>
  )
}
