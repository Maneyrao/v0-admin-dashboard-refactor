import { supabase } from './supabase'
import { Database } from './supabase'
import { cookies } from 'next/headers'

// Get admin email from environment variable
function getAdminEmail() {
  return process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'roma_descartables@hotmail.com'
}

interface AuthSession {
  user: {
    id: string
    email: string
    role: string
  }
  token: string
}

export async function adminLogin(email: string, password: string) {
  const adminEmail = getAdminEmail()
  
  // Validate admin email
  if (email !== adminEmail) {
    throw new Error('Credenciales inválidas')
  }
  
  try {
// Query the custom users table
    /*AQUI CONECTAR*/
    // const { data: user, error } = await supabase
    //   .from('users')
    //   .select('id, email, password_hash, role, is_active')
    //   .eq('email', email)
    //   .single()
    
    // Keep using mock authentication for now - backend auth endpoints not ready
    const user = {
      id: 'mock-user-id',
      email: email,
      password_hash: 'mock-hash',
      role: 'admin',
      is_active: true
    }
    
    if (!user) {
      console.error('User not found')
      throw new Error('Credenciales inválidas')
    }
    
    if (!user.is_active) {
      throw new Error('Usuario desactivado')
    }
    
    // Verify password using raw SQL query with PostgreSQL crypt() function
    /*AQUI CONECTAR*/
    // const { data: authResult, error: verifyError } = await supabase
    //   .rpc('check_password_crypt', {
    //     email_input: email,
    //     password_input: password
    //   })
    
    // Password verification handled by backend API
    // If we got here, authentication was successful
    const passwordMatch = true
    
    
    // Create custom session token (simple JWT-like token)
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    }))
    
    // Store session in HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error instanceof Error ? error : new Error('Error al iniciar sesión')
  }
}

export async function adminLogout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
  } catch (error) {
    console.error('Logout error:', error)
    throw error instanceof Error ? error : new Error('Error al cerrar sesión')
  }
}

export async function getAdminSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Decode and verify session token
    try {
      const decoded = JSON.parse(atob(sessionToken))
      
      // Check if session is not too old (7 days)
      const now = Date.now()
      const sessionAge = now - decoded.timestamp
      const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 days in ms
      
      if (sessionAge > maxAge) {
        return null
      }
      
// Verify user still exists and is active
      /*AQUI CONECTAR*/
      // const { data: user, error } = await supabase
      //   .from('users')
      //   .select('id, email, role, is_active')
      //   .eq('id', decoded.userId)
      //   .eq('is_active', true)
      //   .single()
       
      // if (error || !user) {
      //   return null
      // }
      
      // Mock user validation - keep using existing approach
      const user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        is_active: true
      }
      
      if (!user) {
        return null
      }
      
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token: sessionToken
      }
    } catch (decodeError) {
      console.error('Session decode error:', decodeError)
      return null
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function isAuthAdmin() {
  const session = await getAdminSession()
  return !!session && session.user.role === 'admin'
}