const ACCESS_TOKEN_KEY = 'access_token'
const TOKEN_TYPE_KEY = 'token_type'
const EXPIRES_IN_KEY = 'expires_in'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setToken(token: string, tokenType?: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    if (tokenType) {
      localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
    }
    if (expiresIn !== undefined) {
      localStorage.setItem(EXPIRES_IN_KEY, String(expiresIn))
    }
    console.log('Token stored successfully')
  } catch (error) {
    console.error('Failed to store token:', error)
    throw new Error('No se pudo guardar la sesión')
  }
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
  localStorage.removeItem(EXPIRES_IN_KEY)
}
