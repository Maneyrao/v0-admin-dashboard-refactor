import { NextRequest, NextResponse } from 'next/server'
import { adminLogin as serverAdminLogin } from '@/lib/supabase-auth-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const result = await serverAdminLogin(email, password)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al iniciar sesión' },
      { status: 401 }
    )
  }
}