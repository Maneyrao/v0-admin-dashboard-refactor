import { setToken, clearToken } from './storage'
import { apiPost } from './apiClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function login(email: string, password: string): Promise<void> {
  // Validación básica
  if (!email.trim() || !password) {
    throw new Error('El email y la contraseña son requeridos')
  }

  console.log('=== LOGIN DEBUG ===')
  console.log('API_BASE_URL:', API_BASE_URL)
  
  if (!API_BASE_URL) {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL está vacía o no definida')
    throw new Error('Falta NEXT_PUBLIC_API_BASE_URL. Contacta al administrador.')
  }

  console.log('✅ API_BASE_URL configurada:', API_BASE_URL)
  console.log('📧 Email:', email.trim().toLowerCase())

  try {
    // URL del login
    const loginUrl = `${API_BASE_URL}/auth/login`
    console.log('🌐 Haciendo fetch a:', loginUrl)

    // Headers para el backend
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    }

    // Body en formato x-www-form-urlencoded (OAuth2 compatible)
    const body = new URLSearchParams({
      username: email.trim().toLowerCase(), // OAuth2 usa 'username' aunque sea email
      password: password,
    })

    console.log('📦 Enviando:', body.toString())

    // Fetch directo para debugging
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: headers,
      body: body.toString(),
      mode: 'cors',
      credentials: 'omit',
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Error ${response.status}`
      try {
        const errorData = await response.json()
        console.error('❌ Error response:', errorData)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        console.error('❌ No se pudo parsear error response')
      }
      throw new Error(errorMessage)
    }

    const data: LoginResponse = await response.json()
    console.log('✅ Login response:', data)

    // Guardar token
    setToken(data.access_token, data.token_type, data.expires_in)
    console.log('✅ Token guardado en localStorage')
    
    // Verificación
    const storedToken = localStorage.getItem('access_token')
    console.log('🔍 Verificación - Token en localStorage:', storedToken ? 'SÍ' : 'NO')

  } catch (error) {
    console.error('❌ Login error completo:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Credenciales')) {
        throw new Error('Credenciales inválidas')
      }
      if (error.message.includes('422')) {
        throw new Error('Faltan credenciales')
      }
      if (error.message.includes('CORS') || error.message.includes('blocked')) {
        throw new Error('Error de CORS. Verifica la configuración del servidor.')
      }
      throw error
    }
    throw new Error('Error al iniciar sesión')
  }
}

export function logout(): void {
  clearToken()
}
