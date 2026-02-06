import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createAdminUser() {
  const email = 'roma_descartables@hotmail.com'
  const password = 'admin123'
  
  try {
    // Try to sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Error creating user:', error)
      return
    }
    
    console.log('User created successfully:', data)
    
    // Update user to confirm email using admin client
    if (data.user?.id) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      )
      
      if (updateError) {
        console.error('Error confirming email:', updateError)
        return
      }
      
      console.log('Email confirmed successfully')
    }
    
    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (signInError) {
      console.error('Error signing in:', signInError)
      return
    }
    
    console.log('Sign in successful:', signInData)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()