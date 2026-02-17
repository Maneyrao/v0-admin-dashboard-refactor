'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/lib/auth'
import { getToken } from '@/lib/storage'
import { ROUTE_ADMIN_DASHBOARD } from '@/lib/routes'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || ROUTE_ADMIN_DASHBOARD

  // Redirect if already logged in
  useEffect(() => {
    const token = getToken()
    if (token) {
      router.replace(nextUrl)
    }
  }, [router, nextUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Form submit - Iniciando login...')
    
    // Validación frontend
    if (!email.trim() || !password) {
      setError('El email y la contraseña son requeridos')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      console.log('⏳ Llamando a función login...')
      await login(email, password)
      
      console.log('✅ Login exitoso, verificando token...')
      
      // Verificación inmediata del token
      const token = localStorage.getItem('access_token')
      console.log('🔍 Token después de login:', token ? 'EXISTS' : 'MISSING')
      
      if (token) {
        console.log('🔄 Redirigiendo a:', nextUrl)
        router.replace(nextUrl)
      } else {
        throw new Error('Token no guardado correctamente')
      }
      
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar sesion</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al panel de administracion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="roma_descartables@hotmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  </span>
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <div>
                    <div className="font-medium">{error}</div>
                    {error.includes('NEXT_PUBLIC_API_BASE_URL') && (
                      <div className="text-xs mt-1 opacity-75">
                        Verifica las variables de entorno en Vercel Settings → Environment Variables
                      </div>
                    )}
                    {error.includes('CORS') && (
                      <div className="text-xs mt-1 opacity-75">
                        Verifica CORS_ORIGINS en Railway
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
