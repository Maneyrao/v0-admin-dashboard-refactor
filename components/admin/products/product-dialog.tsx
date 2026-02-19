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
import { 
  useCreateProduct, 
  useUpdateProduct, 
  useSetFeaturedProduct 
} from '@/lib/supabase-services'
import { useUploadMedia } from '@/lib/media-services'

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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false)
  const [pendingFeatured, setPendingFeatured] = useState(false)
  const [images, setImages] = useState<ProductImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const isEditing = !!product

  // React Query hooks
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const setFeaturedProduct = useSetFeaturedProduct()
  const uploadMedia = useUploadMedia()

  useEffect(() => {
    if (!product || !open) {
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setIsPublished(true)
      setIsFeatured(false)
      setPendingFeatured(false)
      setImages([])
      return
    }

    setName(product.name)
    setDescription(product.description || '')
    setPrice(String(product.price))
    setStock(String(product.stock))
    setIsPublished(product.is_published)
    setIsFeatured(product.is_featured)
    setImages(product?.images || [])
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        updateProduct.mutate({
          id: product!.id,
          data: {
            name: name.trim(),
            description: description.trim(),
            price: priceNum,
            stock: stockNum,
            status: isPublished ? 'active' : 'paused',
          }
        })
      } else {
        createProduct.mutate({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          stock: stockNum,
          status: isPublished ? 'active' : 'paused',
        })
        
        if (pendingFeatured) {
          // This will be handled by the createProduct success callback
        }
      }

      onProductUpdate?.()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Error al guardar el producto')
      } else {
        toast.error('Error de conexión')
      }
    } finally {
      setIsSaving(false)
      setIsFeaturedLoading(false)
    }
  }

  const handleToggleFeatured = async () => {
    if (!product) return

    const newStatus = !product.is_featured
    const productId = product.id
    
    if (newStatus && featuredCount >= MAX_FEATURED_PRODUCTS) {
      toast.error(`Límite alcanzado: máximo ${MAX_FEATURED_PRODUCTS} productos destacados`)
      return
    }

    setFeaturedProduct.mutate(
      { id: productId, featured: newStatus },
      {
        onSuccess: () => {
          onProductUpdate?.()
        }
      }
    )
  }

  const handleAddImage = () => {
    if (!isEditing || !product) {
      toast.error('Primero guarda el producto para agregar imágenes')
      return
    }

    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !product) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 8MB')
      return
    }

    setIsUploading(true)

    try {
      await uploadMedia.mutateAsync({
        productId: product.id,
        data: {
          file,
          type: 'image',
          is_primary: images.length === 0,
          order: images.length
        }
      })

      toast.success('Imagen subida exitosamente')
      onProductUpdate?.()
    } catch (error) {
      toast.error('Error al subir la imagen')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!isEditing || !product) return
    
    const updatedImages = images.filter((img) => img.id !== imageId)
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.is_primary)) {
      updatedImages[0].is_primary = true
    }
    setImages(updatedImages)
    toast.success('Imagen eliminada')
  }

  const handleSetPrimary = async (imageId: string) => {
    if (!isEditing || !product) return
    
    setImages(
      images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    )
    toast.success('Imagen principal actualizada')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del producto"
                    required
                    disabled={isSaving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  required
                  disabled={isSaving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del producto..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    disabled={isSaving}
                  />
                  <Label htmlFor="published">Publicado</Label>
                </div>
                
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={isFeatured}
                        onCheckedChange={handleToggleFeatured}
                        disabled={isFeaturedLoading || isSaving}
                      />
                      <Label htmlFor="featured">Destacado</Label>
                    </div>
                    {isFeaturedLoading && <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent" />}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              {isEditing && images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative border rounded-lg overflow-hidden">
                      <img 
                        src={img.image_url} 
                        alt={`Imagen de ${product?.name}`}
                        className="w-full h-32 object-cover"
                      />
                      {img.is_primary && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveImage(img.id)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {isEditing && (
                <Button
                  type="button"
                  onClick={handleAddImage}
                  disabled={isSaving || isUploading || uploadMedia.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading || uploadMedia.isPending ? 'Subiendo...' : 'Agregar Imagen'}
                </Button>
              )}
              
              {!isEditing && (
                <div className="text-center text-muted-foreground py-8">
                  Guarda el producto para agregar imágenes
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && 'Guardando...'}
              {!isSaving && (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}