import { supabase } from './supabase'

// Get admin credentials from environment variables
// Asegúrate de configurar ADMIN_EMAIL y ADMIN_PASSWORD en tus variables de entorno
function getAdminCredentials() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar configurados en las variables de entorno')
  }
  
  return {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  }
}

export async function adminLogin(email: string, password: string) {
  const adminCreds = getAdminCredentials()
  
  // Validate admin credentials
  if (email !== adminCreds.email || password !== adminCreds.password) {
    throw new Error('Credenciales inválidas')
  }
  
  try {
    // Sign in with Supabase
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: adminCreds.email,
      password: adminCreds.password
    })
    
    if (error) {
      console.error('Supabase auth error:', error)
      throw new Error('Error de autenticación')
    }
    
    if (!session) {
      throw new Error('No se pudo iniciar sesión')
    }
    
    return { success: true, session }
  } catch (error) {
    console.error('Login error:', error)
    throw error instanceof Error ? error : new Error('Error al iniciar sesión')
  }
}

export async function adminLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      throw new Error('Error al cerrar sesión')
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw error instanceof Error ? error : new Error('Error al cerrar sesión')
  }
}

export async function getAdminSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }
    
    // For single admin setup, if session exists, it's valid
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function isAuthAdmin() {
  const session = await getAdminSession()
  return !!session
}