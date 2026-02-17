<<<<<<< HEAD
// HTTP Client for FastAPI Backend Integration
// Handles authentication, error handling, and API communication

interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

interface ApiError {
  detail?: string
  message?: string
  status: number
}

class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '') // Remove trailing slash
    this.timeout = config.timeout || 10000 // 10 seconds default
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Get auth token from cookies for server-side requests
    let authToken = null
    
    // Try to get token from different sources
    if (typeof window !== 'undefined') {
      // Client-side: get from document.cookie
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find(cookie => 
        cookie.trim().startsWith('admin_session=')
      )
      if (sessionCookie) {
        authToken = sessionCookie.split('=')[1]?.trim()
      }
    } else {
      // Server-side: we'll need to handle this differently
      // For now, rely on client-side auth
    }

    if (authToken) {
      defaultHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    }

    try {
      const response = await fetch(url, config)
      const status = response.status

      // Handle different response types
      if (status === 204) {
        return { status }
      }

      if (status >= 200 && status < 300) {
        try {
          const data = await response.json()
          return { data, status }
        } catch {
          return { status }
        }
      } else {
        // Handle error responses
        let errorMessage = 'Error en la solicitud'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage
        }

        return { 
          error: errorMessage, 
          status 
        }
      }
    } catch (error) {
      console.error('API Client Error:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Tiempo de espera agotado', status: 408 }
        }
        return { error: error.message, status: 500 }
      }
      
      return { error: 'Error desconocido', status: 500 }
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      url += `?${searchParams.toString()}`
    }

    return this.request<T>(url, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // File upload method
  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth token for upload
    let authToken = null
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      const sessionCookie = cookies.find(cookie => 
        cookie.trim().startsWith('admin_session=')
      )
      if (sessionCookie) {
        authToken = sessionCookie.split('=')[1]?.trim()
      }
    }

    const headers: HeadersInit = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    // Don't set Content-Type for FormData - browser sets it with boundary

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(this.timeout * 2), // Longer timeout for uploads
      })

      const status = response.status

      if (status >= 200 && status < 300) {
        try {
          const data = await response.json()
          return { data, status }
        } catch {
          return { status }
        }
      } else {
        let errorMessage = 'Error en la subida de archivo'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        return { error: errorMessage, status }
      }
    } catch (error) {
      console.error('Upload Error:', error)
      return { 
        error: error instanceof Error ? error.message : 'Error al subir archivo', 
        status: 500 
      }
    }
  }
}

// Create singleton instance with configuration
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-roma-production.up.railway.app',
  timeout: 15000, // 15 seconds
})

export default apiClient

// Export types for use in services
export type { ApiResponse, ApiError, ApiClientConfig }

// Helper function for handling API errors in React Query
export const handleApiError = (error: ApiResponse<any>): string => {
  if (error.error) {
    return error.error
  }
  if (error.status >= 500) {
    return 'Error del servidor. Intente nuevamente.'
  }
  if (error.status >= 400) {
    return 'Solicitud inválida.'
  }
  return 'Error desconocido. Intente nuevamente.'
}
=======
type ApiResult<T> = { data?: T; error?: string; status: number }

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

async function request<T>(
  method: string,
  path: string,
  body?: any
): Promise<ApiResult<T>> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const url = joinUrl(base, path)

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })

    const status = res.status
    const text = await res.text()
    const json = text ? JSON.parse(text) : null

    if (!res.ok) {
      return { status, error: json?.detail || json?.error || `HTTP ${status}` }
    }

    return { status, data: json as T }
  } catch (e: any) {
    return { status: 0, error: e?.message || 'Network error' }
  }
}

const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T>(path: string, body?: any) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: any) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

export default apiClient
>>>>>>> 731b954 (Initial clean frontend)
