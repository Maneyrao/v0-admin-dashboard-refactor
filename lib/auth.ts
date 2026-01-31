import { setToken, clearToken } from './storage'
import { apiPost } from './apiClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function login(email: string, password: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error('API no configurada. Contacta al administrador.')
  }
  
  console.log('Login attempt to API:', API_BASE_URL)

  try {
    const data: LoginResponse = await apiPost<LoginResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    }, { auth: false })
    
    console.log('Login successful, token received')
    setToken(data.access_token, data.token_type, data.expires_in)
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Credenciales')) {
        throw new Error('Credenciales inválidas')
      }
      if (error.message.includes('422')) {
        throw new Error('Faltan credenciales')
      }
      throw error
    }
    throw new Error('Error al iniciar sesión')
  }
}

export function logout(): void {
  clearToken()
}
