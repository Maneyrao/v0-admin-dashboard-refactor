'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { X, Star, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductWithImages, ProductImage } from '@/lib/types'
import { toast } from 'sonner'
import { adminProductsApi } from '@/lib/api/adminProducts'
import { adminMediaApi } from '@/lib/api/adminMedia'
import { ApiError } from '@/lib/apiClient'

const MAX_FEATURED_PRODUCTS = 10

interface ProductDialogProps {
  product?: ProductWithImages | null
  open: boolean
  onOpenChange: (open: boolean) => void
  featuredCount?: number
  onProductUpdate?: () => void
}

export function ProductDialog({ 
  product, 
  open, 
  onOpenChange, 
  featuredCount = 0,
  onProductUpdate 
}: ProductDialogProps) {
  const isEditing = !!product

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [images, setImages] = useState<ProductImage[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false)

  // Track if featured was changed from original (for create flow)
  const [pendingFeatured, setPendingFeatured] = useState(false)

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price.toString())
      setStock(product.stock.toString())
      setIsPublished(product.is_published)
      setIsFeatured(product.is_featured)
      setImages(product.images || [])
      setPendingFeatured(false)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setIsPublished(true)
      setIsFeatured(false)
      setImages([])
      setPendingFeatured(false)
    }
  }, [product, open])

  const handleFeaturedChange = async (checked: boolean) => {
    // For new products, just store the preference
    if (!isEditing) {
      // Check limit before allowing
      if (checked && featuredCount >= MAX_FEATURED_PRODUCTS) {
        toast.error(`Límite alcanzado: máximo ${MAX_FEATURED_PRODUCTS} productos destacados`)
        return
      }
      setIsFeatured(checked)
      setPendingFeatured(checked)
      return
    }

    // For existing products, call API immediately
    if (checked && featuredCount >= MAX_FEATURED_PRODUCTS) {
      toast.error(`Límite alcanzado: máximo ${MAX_FEATURED_PRODUCTS} productos destacados`)
      return
    }

    setIsFeaturedLoading(true)
    const previousValue = isFeatured
    setIsFeatured(checked) // Optimistic update

    try {
      await adminProductsApi.setFeatured(product!.id, checked)
      toast.success(checked ? 'Producto destacado' : 'Producto ya no está destacado')
      onProductUpdate?.()
    } catch (error) {
      // Revert on error
      setIsFeatured(previousValue)
      
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error(`Límite alcanzado: máximo ${MAX_FEATURED_PRODUCTS} productos destacados`)
        } else {
          toast.error('Error al actualizar el producto')
        }
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setIsFeaturedLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('El precio debe ser un número válido')
      return
    }

    const stockNum = parseInt(stock)
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('El stock debe ser un número válido mayor o igual a 0')
      return
    }

    setIsSaving(true)

    try {
      if (isEditing) {
        // Update product
        await adminProductsApi.update(product!.id, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          stock: stockNum,
          is_published: isPublished,
        })
        toast.success('Producto actualizado')
      } else {
        // Create product
        const newProduct = await adminProductsApi.create({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          stock: stockNum,
          is_published: isPublished,
          is_featured: false, // Always create as not featured first
        })
        
        toast.success('Producto creado')
        
        // If featured was enabled, make the separate API call
        if (pendingFeatured) {
          try {
            await adminProductsApi.setFeatured(newProduct.id, true)
            toast.success('Producto marcado como destacado')
          } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
              toast.error(`No se pudo destacar: límite de ${MAX_FEATURED_PRODUCTS} productos alcanzado`)
            } else {
              toast.error('Producto creado, pero no se pudo marcar como destacado')
            }
          }
        }
      }

      onProductUpdate?.()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Error al guardar el producto')
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddImage = async () => {
    if (!isEditing || !product) {
      toast.error('Primero guarda el producto para agregar imágenes')
      return
    }

    // For now, add placeholder - in real app, this would trigger file upload
    const newImage: ProductImage = {
      id: Math.random().toString(),
      product_id: product.id,
      image_url: '/placeholder.svg?height=200&width=200',
      is_primary: images.length === 0,
      created_at: new Date().toISOString(),
    }
    setImages([...images, newImage])
    toast.success('Imagen agregada')
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!isEditing || !product) return
    
    try {
      await adminMediaApi.remove(product.id, imageId)
      const updatedImages = images.filter((img) => img.id !== imageId)
      if (updatedImages.length > 0 && !updatedImages.some((img) => img.is_primary)) {
        updatedImages[0].is_primary = true
      }
      setImages(updatedImages)
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar imagen')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    if (!isEditing || !product) return
    
    try {
      await adminMediaApi.setPrimary(product.id, imageId)
      setImages(
        images.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      )
      toast.success('Imagen principal actualizada')
    } catch {
      toast.error('Error al actualizar imagen principal')
    }
  }

  const canEnableFeatured = !isFeatured && featuredCount < MAX_FEATURED_PRODUCTS
  const isAtFeaturedLimit = featuredCount >= MAX_FEATURED_PRODUCTS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del producto"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="published">Publicado</Label>
                  <p className="text-sm text-muted-foreground">
                    El producto será visible en la tienda
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${isFeatured ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    <Label htmlFor="featured">Producto destacado</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aparece primero en la tienda (máx. {MAX_FEATURED_PRODUCTS})
                  </p>
                  {isAtFeaturedLimit && !isFeatured && (
                    <p className="text-sm text-destructive">
                      Límite alcanzado
                    </p>
                  )}
                </div>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={handleFeaturedChange}
                  disabled={isFeaturedLoading || (!canEnableFeatured && !isFeatured)}
                />
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  El stock no puede ser menor a 0. Cuando llegue a 0, el producto quedará como sin stock.
                </p>
              </div>

              {parseInt(stock) === 0 && stock !== '' && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">
                    Sin stock
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este producto no tiene stock disponible.
                  </p>
                </div>
              )}

              {parseInt(stock) > 0 && parseInt(stock) <= 5 && (
                <div className="rounded-lg border border-orange-500/50 bg-orange-500/5 p-4">
                  <p className="text-sm font-medium text-orange-600">
                    Stock bajo
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este producto tiene stock bajo. Considera reabastecerlo pronto.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg border bg-muted overflow-hidden group"
                  >
                    <img
                      src={image.image_url || "/placeholder.svg"}
                      alt="Producto"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetPrimary(image.id)}
                        title="Marcar como principal"
                      >
                        <Star className={`h-4 w-4 ${image.is_primary ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveImage(image.id)}
                        title="Eliminar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Image Button */}
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Agregar</span>
                </button>
              </div>

              {!isEditing && (
                <p className="text-sm text-muted-foreground">
                  Primero guarda el producto para poder agregar imágenes.
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
