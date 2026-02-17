'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductWithImages } from '@/lib/types'
import { toast } from 'sonner'
import { adminProductsApi } from '@/lib/api/adminProducts'
import { ApiError } from '@/lib/apiClient'

interface StockAdjustmentDialogProps {
  product: ProductWithImages | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdate?: () => void
}

type AdjustmentType = 'add' | 'remove' | 'set'

const reasons = [
  'Reabastecimiento',
  'Corrección de inventario',
  'Devolución de cliente',
  'Producto dañado',
  'Venta manual',
  'Otro',
]

export function StockAdjustmentDialog({
  product,
  open,
  onOpenChange,
  onProductUpdate,
}: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAdjustmentType('add')
      setQuantity('')
      setReason('')
      setNotes('')
    }
  }, [open])

  if (!product) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Ingresa una cantidad válida mayor a 0')
      return
    }

    if (!reason) {
      toast.error('Selecciona un motivo')
      return
    }

    // Calculate new stock
    let newStock: number
    switch (adjustmentType) {
      case 'add':
        newStock = product.stock + qty
        break
      case 'remove':
        newStock = product.stock - qty
        if (newStock < 0) {
          toast.error('El stock no puede ser negativo')
          return
        }
        break
      case 'set':
        newStock = qty
        break
    }

    setIsSaving(true)

    try {
      await adminProductsApi.update(product.id, { stock: newStock })
      toast.success(`Stock actualizado: ${product.stock} → ${newStock}`)
      onProductUpdate?.()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Error al actualizar el stock')
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const getPreviewStock = () => {
    const qty = parseInt(quantity) || 0
    switch (adjustmentType) {
      case 'add':
        return product.stock + qty
      case 'remove':
        return Math.max(0, product.stock - qty)
      case 'set':
        return qty
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Info */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              Stock actual: <span className="font-semibold text-foreground">{product.stock} unidades</span>
            </p>
          </div>

          {/* Adjustment Type */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={adjustmentType === 'add' ? 'default' : 'outline'}
              className="flex items-center gap-1"
              onClick={() => setAdjustmentType('add')}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
            <Button
              type="button"
              variant={adjustmentType === 'remove' ? 'default' : 'outline'}
              className="flex items-center gap-1"
              onClick={() => setAdjustmentType('remove')}
            >
              <Minus className="h-4 w-4" />
              Quitar
            </Button>
            <Button
              type="button"
              variant={adjustmentType === 'set' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('set')}
            >
              Establecer
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === 'set' ? 'Nuevo stock' : 'Cantidad'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-sm">
                Stock resultante:{' '}
                <span className={`font-bold ${getPreviewStock() === 0 ? 'text-destructive' : getPreviewStock() <= 5 ? 'text-primary' : 'text-foreground'}`}>
                  {getPreviewStock()} unidades
                </span>
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar detalles adicionales..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Confirmar ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
