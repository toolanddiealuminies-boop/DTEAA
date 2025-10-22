# Registration Troubleshooting Guide

## Overview
This document helps diagnose registration failures in the DTEAA Alumni Registration System.

## How to Access Logs

When a user encounters a registration error:

1. **Open Browser Console**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Enable Developer menu in Preferences, then press `Cmd+Option+C`

2. **Look for the Registration Log**:
   - The console will show detailed logs starting with `=== REGISTRATION STARTED ===`
   - All registration steps are numbered (Step 1, Step 2, etc.)
   - Errors are clearly marked with `ERROR` or `FAILED`

## Registration Steps

The registration process has 5 main steps:

### Step 1: Profile Photo Upload (Optional)
```
>>> Step 1: Uploading profile photo...
```
**What it does**: Converts and uploads profile photo to Supabase storage bucket `photos`

**Common Issues**:
- ❌ **Photo upload failed**: Check if `photos` bucket exists and is accessible
- ❌ **Bucket policy error**: Verify storage policies allow authenticated users to upload
- ✅ **Note**: Profile photo upload failures don't stop registration

**Log Example**:
```
PHOTO UPLOAD FAILED: {
  error: {...},
  message: "new row violates row-level security policy",
  statusCode: 403
}
```

### Step 2: Receipt Upload (Required)
```
>>> Step 2: Uploading payment receipt...
```
**What it does**: Uploads payment receipt to Supabase storage bucket `receipts`

**Common Issues**:
- ❌ **Receipt upload failed**: Registration stops immediately
- ❌ **File too large**: Check file size limits (default: 50MB)
- ❌ **Invalid file type**: Only image files are accepted
- ❌ **Bucket doesn't exist**: Ensure `receipts` bucket is created
- ❌ **Storage policy blocks upload**: Check RLS policies on `receipts` bucket

**Log Example**:
```
RECEIPT UPLOAD FAILED: {
  error: {...},
  message: "The resource already exists",
  fileName: "abc123/1234567890.jpg"
}
```

### Step 3: Alumni ID Generation
```
>>> Step 3: Validating year and generating Alumni ID...
```
**What it does**: Generates unique Alumni ID (format: `DTEAA-YYYY-NNNN`)

**Common Issues**:
- ❌ **Year validation failed**: Invalid pass out year format
- ❌ **Can't query existing IDs**: Database read permission issue

**Log Example**:
```
Pass out year: 2024
Generated new alumni_id: DTEAA-2024-0042
```

### Step 4: Database Insert (Most Common Failure Point)
```
>>> Step 4: Inserting profile into database...
```
**What it does**: Inserts user profile into `profiles` table

**Common Issues**:

#### 1. **RLS (Row Level Security) Policy Issue** ⚠️ MOST COMMON
```
DATABASE INSERT FAILED - Attempt #1: {
  errorCode: "42501",
  errorMessage: "new row violates row-level security policy for table \"profiles\""
}
```
**Solution**:
- Check Supabase RLS policies on `profiles` table
- Ensure authenticated users can INSERT their own records
- Required policy example:
  ```sql
  CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
  ```

#### 2. **Missing Columns**
```
DATABASE INSERT FAILED: {
  errorCode: "42703",
  errorMessage: "column \"specialization\" does not exist"
}
```
**Solution**:
- Add missing column to database table
- Or update frontend to not send that field

#### 3. **Data Type Mismatch**
```
DATABASE INSERT FAILED: {
  errorCode: "22P02",
  errorMessage: "invalid input syntax for type json"
}
```
**Solution**:
- Check that JSONB columns (personal, contact, experience) receive proper objects
- Verify no circular references in data

#### 4. **Unique Constraint Violation**
```
DATABASE INSERT FAILED: {
  errorCode: "23505",
  errorMessage: "duplicate key value violates unique constraint"
}
```
**Solution**:
- System automatically retries up to 5 times
- If persistent, check for duplicate `alumni_id` or `id` values

#### 5. **Permission Denied**
```
DATABASE INSERT FAILED: {
  errorCode: "42501",
  errorMessage: "permission denied for table profiles"
}
```
**Solution**:
- Grant INSERT permission to authenticated users
- Check Supabase role permissions

### Step 5: Finalization
```
>>> Step 5: Finalizing registration...
✓✓✓ REGISTRATION COMPLETED SUCCESSFULLY! ✓✓✓
```
**What it does**: Updates frontend state with new user data

## Common Error Patterns

### Pattern 1: All Registrations Fail
**Symptom**: Every user gets "Failed to save registration"

**Likely Cause**: RLS policy missing or incorrect

**Solution**:
1. Go to Supabase Dashboard → Authentication → Policies
2. Check `profiles` table policies
3. Add policy for INSERT if missing

### Pattern 2: Random Failures
**Symptom**: Some users succeed, others fail randomly

**Likely Causes**:
- Network timeouts
- Large file uploads failing
- Race conditions with alumni_id generation

**Solution**:
- Check network logs for failed requests
- Reduce receipt file size
- System automatically retries 5 times for conflicts

### Pattern 3: Specific Users Always Fail
**Symptom**: Same users consistently fail

**Likely Causes**:
- User already has a profile in database
- User's auth account has issues
- Special characters in user data causing SQL issues

**Solution**:
1. Check if profile already exists: `SELECT * FROM profiles WHERE id = 'user_id';`
2. Delete existing profile if it's incomplete
3. Sanitize user input data

## Diagnostic Checklist

When investigating failures, check:

- [ ] Console logs show all 5 steps
- [ ] Receipt upload succeeded (Step 2)
- [ ] Alumni ID was generated (Step 3)
- [ ] Database insert attempt was made (Step 4)
- [ ] Error code and message are visible
- [ ] RLS policies exist on `profiles` table
- [ ] User is authenticated (check session)
- [ ] `profiles` table has all required columns
- [ ] Storage buckets (`photos`, `receipts`) exist
- [ ] Storage policies allow uploads

## Supabase Database Schema Requirements

### Required Table: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  alumni_id TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  payment_receipt TEXT,
  profile_photo TEXT,
  personal JSONB,
  contact JSONB,
  experience JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Required RLS Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### Required Storage Buckets

1. **`receipts` bucket**
   - For payment receipts
   - Policy: Authenticated users can upload

2. **`photos` bucket**
   - For profile photos
   - Policy: Authenticated users can upload

## Quick Fixes

### Fix 1: Enable Detailed Logging Temporarily
The logging is already enabled. Just open browser console to see logs.

### Fix 2: Test with Minimal Data
Try registering with:
- Minimum required fields
- No profile photo
- Smallest possible receipt image
- No optional experience data

### Fix 3: Check User's Browser
- Ensure JavaScript is enabled
- Clear browser cache
- Try incognito/private mode
- Test in different browser

## Getting Help

When reporting issues, provide:
1. Full console log from `=== REGISTRATION STARTED ===` to `=== END ===`
2. User's email (for database lookup)
3. Timestamp of failure
4. Error code from alert message
5. Screenshot of error

## Contact

For database/Supabase issues, check:
- Supabase Dashboard → Logs
- Supabase Dashboard → API Logs
- Supabase Dashboard → Storage Logs
