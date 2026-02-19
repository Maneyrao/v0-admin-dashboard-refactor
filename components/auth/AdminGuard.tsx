'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAdminSession } from '@/lib/supabase-auth'
import { ROUTE_ADMIN_LOGIN } from '@/lib/routes'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getAdminSession()
        
        if (!session) {
          // No session - redirect to login
          const nextUrl = encodeURIComponent(pathname)
          router.replace(`${ROUTE_ADMIN_LOGIN}?next=${nextUrl}`)
          return
        }

        // Session exists - allow render
        setIsAuthorized(true)
        setIsChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        // On error, redirect to login
        const nextUrl = encodeURIComponent(pathname)
        router.replace(`${ROUTE_ADMIN_LOGIN}?next=${nextUrl}`)
      }
    }

    checkAuth()
  }, [router, pathname])

  // Show skeleton while checking auth
  if (isChecking) {
    return <AdminGuardSkeleton />
  }

  // Not authorized - show nothing (redirect is happening)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

function AdminGuardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-sidebar lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <Skeleton className="h-9 w-9 rounded-lg bg-sidebar-accent" />
          <Skeleton className="h-5 w-24 bg-sidebar-accent" />
        </div>
        <div className="space-y-2 px-3 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg bg-sidebar-accent" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="lg:pl-64">
        {/* Topbar skeleton */}
        <div className="h-16 border-b bg-card flex items-center px-6">
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Page content skeleton */}
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
