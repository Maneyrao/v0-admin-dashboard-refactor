import { getToken, clearToken } from './storage'
import { ROUTE_ADMIN_LOGIN } from './routes'

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean
  body?: RequestInit['body'] | Record<string, unknown>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, body, headers: customHeaders, ...restOptions } = options

  const headers: HeadersInit = {
    ...customHeaders,
  }

  // Add Authorization header if auth is required and token exists
  if (auth) {
    const token = getToken()
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  // Handle body
  let processedBody: RequestInit['body'] | undefined

  if (body !== undefined) {
    // If it's already a string, URLSearchParams, or FormData, pass through
    if (
      typeof body === 'string' ||
      body instanceof URLSearchParams ||
      body instanceof FormData
    ) {
      processedBody = body
    } else if (typeof body === 'object') {
      // JSON object
      ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
      processedBody = JSON.stringify(body)
    }
  }

  const url = `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: processedBody,
  })

  // Handle 401 - Unauthorized (invalid/expired token)
  if (response.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') {
      // Use Next.js router compatible redirect
      window.location.replace(ROUTE_ADMIN_LOGIN)
    }
    throw new ApiError('No autorizado', 401)
  }

  // Handle 403 - Forbidden (no permission)
  if (response.status === 403) {
    throw new ApiError('No autorizado', 403)
  }

  // Handle other errors
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch {
      // Ignore JSON parse errors
    }
    throw new ApiError(errorMessage, response.status, errorMessage)
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  // Parse JSON response
  try {
    return await response.json()
  } catch {
    return undefined as T
  }
}

// Convenience methods
export const apiGet = <T>(path: string, options?: Omit<ApiOptions, 'method'>) => {
  return api<T>(path, { ...options, method: 'GET' })
}

export const apiPost = <T>(path: string, body?: ApiOptions['body'], options?: Omit<ApiOptions, 'method' | 'body'>) => {
  return api<T>(path, { ...options, method: 'POST', body })
}

export const apiPut = <T>(path: string, body?: ApiOptions['body'], options?: Omit<ApiOptions, 'method' | 'body'>) => {
  return api<T>(path, { ...options, method: 'PUT', body })
}

export const apiPatch = <T>(path: string, body?: ApiOptions['body'], options?: Omit<ApiOptions, 'method' | 'body'>) => {
  return api<T>(path, { ...options, method: 'PATCH', body })
}

export const apiDelete = <T>(path: string, options?: Omit<ApiOptions, 'method'>) => {
  return api<T>(path, { ...options, method: 'DELETE' })
}
