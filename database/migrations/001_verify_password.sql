-- Create password verification function for custom authentication
-- This version uses the most secure and efficient approach
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION check_password_crypt(email_input TEXT, password_input TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM users 
    WHERE email = email_input 
    AND is_active = true 
    AND password_hash = crypt(password_input, password_hash)
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_password_crypt TO authenticated;
GRANT EXECUTE ON FUNCTION check_password_crypt TO anon;