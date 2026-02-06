import { NextRequest, NextResponse } from 'next/server'
import { adminLogout } from '@/lib/supabase-auth-server'

export async function POST() {
  try {
    await adminLogout()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}