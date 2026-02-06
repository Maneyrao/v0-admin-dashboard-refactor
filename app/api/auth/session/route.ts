import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/supabase-auth-server'

export async function GET() {
  try {
    const session = await getAdminSession()
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ session: null })
  }
}