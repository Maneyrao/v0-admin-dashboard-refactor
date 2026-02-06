## 🔍 Authentication Diagnosis Report

### **Issue Analysis**

Based on the code analysis, the authentication failure with "Credenciales inválidas" can occur at these specific checkpoints:

#### **Primary Suspects:**

**1. Missing `verify_password` Function (Most Likely)**
- Line 45-49 in `lib/supabase-auth-server.ts` calls `supabase.rpc('verify_password')`
- If this function doesn't exist in Supabase, it will throw an error
- This will cause the login to fail with "Credenciales inválidas"

**2. User Lookup Failure**
- Line 29-33: User query might fail if user doesn't exist
- Line 35-38: Any database error or no user found throws "Credenciales inválidas"

**3. Password Verification Failure**
- Line 51-54: Even if function exists, password might not match hash
- The bcrypt hash generated might not be compatible with `crypt()` function

### **Diagnostic Steps Required:**

#### **Step 1: Verify Function Exists**
```sql
-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'verify_password' 
AND routine_schema = 'public';
```

#### **Step 2: Verify User Data**
```sql
-- Check user exists and has proper data
SELECT id, email, role, is_active, length(password_hash) as hash_length
FROM users 
WHERE email = 'roma_descartables@hotmail.com';
```

#### **Step 3: Test Password Verification**
```sql
-- Test password verification directly
SELECT 
  email,
  crypt('admin123', password_hash) = password_hash as password_match,
  password_hash
FROM users 
WHERE email = 'roma_descartables@hotmail.com';
```

#### **Step 4: Check RPC Permissions**
```sql
-- Test RPC call
SELECT * FROM verify_password('admin123', 'your_hash_here');
```

### **Most Likely Root Cause:**

The `verify_password` function was never created in your Supabase database. The migration file exists but wasn't executed.

### **Required Action:**

Execute this SQL in your Supabase Dashboard > SQL Editor:

```sql
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$;

GRANT EXECUTE ON FUNCTION verify_password TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password TO anon;
```

### **Verification:**

After executing the function, you can test:
1. Navigate to `/debug-auth` (I created this debug page)
2. Click "Run Debug Tests" 
3. Check if all tests pass
4. Test login with credentials: `roma_descartables@hotmail.com` / `admin123`

### **Alternative Diagnosis:**

If function exists and still fails, the issue might be:
1. **Password hash incompatibility** - The `gen_salt('bf')` method might create hashes not compatible with direct `crypt()` verification
2. **User not found** - Email case sensitivity or user doesn't exist
3. **RPC permissions** - Function exists but anon/authenticated roles can't execute it

The debug page at `/debug-auth` will provide detailed information about which specific step is failing.