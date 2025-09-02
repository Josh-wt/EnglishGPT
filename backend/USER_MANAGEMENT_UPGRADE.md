# Assessment Users Management System - Upgrade Guide

## Overview

This upgrade implements a comprehensive user management system with soft delete capabilities, auth/database sync recovery, and audit trails to fix the critical issue where users are authenticated but their database records are missing.

## Current Issue

- **Problem**: User `cfebece0-f495-417a-9671-d6a3225d196a` is authenticated but their database record was accidentally deleted
- **Symptoms**: 
  - API calls return 404 "User not found" errors
  - User creation fails with 500 errors 
  - App gets stuck in error loop
  - Frontend shows user as authenticated but backend can't find them

## Solution Components

### 1. Database Schema Changes
- **Soft Delete Pattern**: Users are marked as deleted instead of being removed
- **Audit Trail**: Complete logging of all user operations
- **Recovery Functions**: SQL functions to handle auth/database mismatches
- **Data Integrity**: Proper constraints and indexes

### 2. Backend Service Layer
- **UserManagementService**: Centralized user operations with soft delete support
- **AuthRecoveryMiddleware**: Automatic detection and recovery of auth/database mismatches
- **Error Handling**: Comprehensive error handling for edge cases

### 3. Recovery Mechanisms
- **Automatic Recovery**: Middleware detects missing users and recovers them
- **Manual Recovery**: API endpoint for manual user recovery
- **Audit Logging**: Track all recovery operations

## Installation Steps

### Step 1: Apply Database Migration

Run the SQL migration in your Supabase SQL Editor:

```bash
# Apply the soft delete migration
cat database/soft_delete_migration.sql | supabase sql
```

Or copy and paste the contents of `database/soft_delete_migration.sql` into your Supabase SQL Editor.

### Step 2: Install Python Dependencies

The new system uses the existing dependencies, but ensure you have:

```bash
pip install fastapi supabase python-dotenv pydantic
```

### Step 3: Update Backend Code

The following files have been created/updated:

**New Files:**
- `backend/user_management_service.py` - Core user management service
- `backend/auth_recovery_middleware.py` - Automatic auth recovery middleware
- `backend/test_user_recovery.py` - Test script for recovery functionality
- `database/soft_delete_migration.sql` - Database schema migration

**Updated Files:**
- `backend/server.py` - Integrated user management service into all endpoints

### Step 4: Test the System

Run the test script to verify everything works:

```bash
cd backend
python test_user_recovery.py
```

This will:
- Test the SQL functions
- Recover the failing user `cfebece0-f495-417a-9671-d6a3225d196a`
- Verify all user operations work
- Show audit log entries

### Step 5: Restart the Backend

Restart your backend service to apply the changes:

```bash
# If using systemd
sudo systemctl restart your-backend-service

# If running manually
pkill -f "uvicorn\|python.*server.py"
python server.py
```

## New API Endpoints

### User Recovery
```bash
POST /api/users/recover
{
  "user_id": "cfebece0-f495-417a-9671-d6a3225d196a",
  "email": "user@example.com",
  "metadata": {
    "name": "User Name",
    "avatar_url": "https://..."
  }
}
```

### User Management Statistics
```bash
GET /api/users/stats
```

### Orphaned Users (Soft Deleted)
```bash
GET /api/users/orphaned
```

## Key Features

### 1. Soft Delete Pattern
- Users are never actually deleted from the database
- `deleted_at` timestamp marks when user was "deleted"
- `active_assessment_users` view shows only non-deleted users
- Recovery is possible by setting `deleted_at` to `NULL`

### 2. Automatic Recovery
- Middleware detects when authenticated users are missing from database
- Automatically attempts to recover/recreate user records
- Uses multiple recovery strategies (auth sync, creation, restoration)

### 3. Audit Trail
- Complete log of all user operations in `assessment_user_audit_log` table
- Tracks creation, updates, deletion, and restoration
- Includes old and new data for change tracking
- Records who performed each operation

### 4. Data Integrity
- Unique constraints on user IDs
- Foreign key relationships maintained
- Indexes for performance
- Proper error handling

## SQL Functions Reference

### `create_or_restore_assessment_user()`
Creates a new user or restores a deleted one.

**Parameters:**
- `p_uid` (TEXT): User ID from Supabase Auth
- `p_email` (TEXT): User email
- `p_display_name` (TEXT): Display name (optional)
- `p_academic_level` (TEXT): Academic level (default: 'igcse')
- `p_current_plan` (TEXT): Subscription plan (default: 'free')
- `p_credits` (INTEGER): Available credits (default: 3)
- `p_is_launch_user` (BOOLEAN): Launch user flag (default: false)
- `p_photo_url` (TEXT): Profile photo URL (optional)
- `p_dark_mode` (BOOLEAN): Dark mode preference (default: false)

**Returns:** User UID (TEXT)

### `soft_delete_assessment_user()`
Marks a user as deleted without removing data.

**Parameters:**
- `p_uid` (TEXT): User ID to soft delete
- `p_deleted_by` (TEXT): ID of user performing deletion (optional)

**Returns:** BOOLEAN (success/failure)

### `get_user_management_stats()`
Returns user management statistics.

**Returns:** JSONB with user counts

## Troubleshooting

### Issue: User Still Getting 404 Errors

1. **Check if migration was applied:**
   ```sql
   SELECT EXISTS (
     SELECT 1 FROM information_schema.columns 
     WHERE table_name = 'assessment_users' 
     AND column_name = 'deleted_at'
   );
   ```

2. **Check if user exists in any state:**
   ```sql
   SELECT uid, email, deleted_at 
   FROM assessment_users 
   WHERE uid = 'cfebece0-f495-417a-9671-d6a3225d196a';
   ```

3. **Check if functions exist:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name LIKE '%assessment_user%';
   ```

### Issue: 500 Errors During User Creation

1. **Check function permissions:**
   ```sql
   GRANT EXECUTE ON FUNCTION create_or_restore_assessment_user TO authenticated;
   ```

2. **Check for constraint violations:**
   ```sql
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'assessment_users';
   ```

### Issue: Middleware Not Working

1. **Check if user management service is initialized:**
   - Look for "User management service initialized successfully" in logs
   - Verify SUPABASE_SERVICE_ROLE_KEY is set

2. **Check middleware registration:**
   - Look for "Auth recovery middleware added successfully" in logs

## Monitoring

### User Management Stats
Check user management statistics regularly:

```bash
curl -X GET "https://your-domain.com/api/users/stats"
```

### Audit Log
Monitor user operations:

```sql
SELECT * FROM assessment_user_audit_log 
ORDER BY performed_at DESC 
LIMIT 10;
```

### Orphaned Users
Check for soft-deleted users that might need attention:

```bash
curl -X GET "https://your-domain.com/api/users/orphaned"
```

## Recovery for Current Issue

For the specific user `cfebece0-f495-417a-9671-d6a3225d196a`:

1. **Immediate fix via API:**
   ```bash
   curl -X POST "https://your-domain.com/api/users/recover" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "cfebece0-f495-417a-9671-d6a3225d196a",
       "email": "user@actual-email.com",
       "metadata": {"name": "Actual User Name"}
     }'
   ```

2. **Or via test script:**
   ```bash
   cd backend
   python test_user_recovery.py
   ```

3. **Or via SQL:**
   ```sql
   SELECT create_or_restore_assessment_user(
     'cfebece0-f495-417a-9671-d6a3225d196a',
     'user@actual-email.com',
     'Actual User Name',
     'igcse',
     'free',
     3,
     false
   );
   ```

## Security Considerations

1. **Service Role Key**: The system uses service role key to bypass RLS
2. **Audit Trail**: All operations are logged with timestamps
3. **Soft Delete**: Data is preserved for security and compliance
4. **Input Validation**: All inputs are validated and sanitized

## Performance Considerations

1. **Indexes**: Added indexes on `deleted_at`, `uid`, `email`
2. **Views**: `active_assessment_users` view filters deleted users efficiently
3. **Function Optimization**: SQL functions use efficient queries
4. **Caching**: Consider adding Redis caching for frequent user lookups

## Future Enhancements

1. **Automated Cleanup**: Hard delete very old soft-deleted users
2. **Recovery Analytics**: Track recovery patterns and success rates
3. **User Sync Jobs**: Regular jobs to sync auth users with database
4. **Real-time Monitoring**: Alerts for auth/database mismatches

## Contact

If you encounter issues with this upgrade, check:

1. The test script output: `python test_user_recovery.py`
2. Backend logs for error messages
3. Supabase logs for SQL function execution
4. API response codes and error messages

The system is designed to be robust and self-healing, automatically recovering from most auth/database sync issues.
