import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug: Starting authentication debugging...')
    
    // Test 1: Check if we can connect to users table
    console.log('🔍 Test 1: Checking users table access...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, is_active, password_hash')
      .eq('email', 'roma_descartables@hotmail.com')
    
    if (usersError) {
      console.error('❌ Users table error:', usersError)
      return NextResponse.json({ 
        error: 'Database access failed', 
        details: usersError 
      }, { status: 500 })
    }
    
    console.log('✅ Users table access successful:', users?.length || 0, 'users found')
    
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        email: 'roma_descartables@hotmail.com'
      }, { status: 404 })
    }
    
    const user = users[0]
    console.log('✅ User found:', { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      is_active: user.is_active,
      has_password_hash: !!user.password_hash
    })
    
    // Test 2: Check if check_password_crypt function exists
    console.log('🔍 Test 2: Checking check_password_crypt function...')
    const { data: funcExists, error: funcError } = await supabase
      .rpc('check_password_crypt', {
        email_input: 'roma_descartables@hotmail.com',
        password_input: 'admin123'
      })
    
    if (funcError) {
      console.error('❌ verify_password function error:', funcError)
      
      // Test 3: Try direct password verification
      console.log('🔍 Test 3: Trying direct SQL verification...')
      const { data: directTest, error: directError } = await supabase
        .from('users')
        .select('crypt(\'admin123\', password_hash) = password_hash as password_match')
        .eq('email', 'roma_descartables@hotmail.com')
        .single()
      
      if (directError) {
        console.error('❌ Direct verification error:', directError)
        return NextResponse.json({ 
          error: 'Direct verification failed',
          details: directError
        }, { status: 500 })
      }
      
      console.log('✅ Direct verification result:', directTest)
      
      return NextResponse.json({
        status: 'debug_complete',
        tests: {
          users_table: '✅ OK',
          check_password_crypt_function: '❌ MISSING',
          direct_verification: directTest,
          user_found: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            has_password_hash: !!user.password_hash
          }
        }
      })
    }
    
    console.log('✅ verify_password function result:', funcExists)
    
    return NextResponse.json({
      status: 'all_tests_passed',
      tests: {
        users_table: '✅ OK',
        check_password_crypt_function: '✅ OK',
        password_match: funcExists,
        user_found: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          has_password_hash: !!user.password_hash
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}