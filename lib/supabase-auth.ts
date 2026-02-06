// Client-side authentication functions (for use in components)
// These make API calls to server-side handlers

interface AuthSession {
  user: {
    id: string
    email: string
    role: string
  }
  token: string
}

// Client-side login API call
export async function adminLogin(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Error de autenticación')
  }

  return response.json()
}

// Client-side logout API call
export async function adminLogout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Error al cerrar sesión')
  }
}

// Client-side session check
export async function getAdminSession(): Promise<AuthSession | null> {
  const response = await fetch('/api/auth/session')
  
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.session
}

export async function isAuthAdmin() {
  const session = await getAdminSession()
  return !!session && session.user.role === 'admin'
}