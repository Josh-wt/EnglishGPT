-- CRITICAL: Revert RLS changes that broke user access
-- This script restores permissive policies for authenticated users

-- 1. RESTORE PERMISSIVE POLICIES FOR SUBSCRIPTION TABLES
-- These should be accessible to all authenticated users for catalog/reference purposes

-- subscriptions table - restore permissive access
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view subscription catalog" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role full access to subscriptions" ON public.subscriptions;

CREATE POLICY "Allow all operations on subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- subscription_features table - restore permissive access
DROP POLICY IF EXISTS "Users can view features of their subscriptions" ON public.subscription_features;
DROP POLICY IF EXISTS "Authenticated users can view subscription features" ON public.subscription_features;
DROP POLICY IF EXISTS "Service role full access to subscription_features" ON public.subscription_features;

CREATE POLICY "Allow all operations on subscription_features"
ON public.subscription_features
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- subscription_tags table - restore permissive access
DROP POLICY IF EXISTS "Users can view tags of their subscriptions" ON public.subscription_tags;
DROP POLICY IF EXISTS "Authenticated users can view subscription tags" ON public.subscription_tags;
DROP POLICY IF EXISTS "Service role full access to subscription_tags" ON public.subscription_tags;

CREATE POLICY "Allow all operations on subscription_tags"
ON public.subscription_tags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- subscription_usage table - restore permissive access
DROP POLICY IF EXISTS "Users can view usage of their subscriptions" ON public.subscription_usage;
DROP POLICY IF EXISTS "Authenticated users can view subscription usage catalog" ON public.subscription_usage;
DROP POLICY IF EXISTS "Service role full access to subscription_usage" ON public.subscription_usage;

CREATE POLICY "Allow all operations on subscription_usage"
ON public.subscription_usage
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- subscription_billing_history table - restore permissive access
DROP POLICY IF EXISTS "Users can view their own billing history" ON public.subscription_billing_history;
DROP POLICY IF EXISTS "Authenticated users can view billing history catalog" ON public.subscription_billing_history;
DROP POLICY IF EXISTS "Service role full access to subscription_billing_history" ON public.subscription_billing_history;

CREATE POLICY "Allow all operations on subscription_billing_history"
ON public.subscription_billing_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. DISABLE RLS ON ASSESSMENT_FEEDBACK IF IT'S CAUSING ISSUES
-- (Keep RLS enabled but ensure policies allow proper access)
-- If needed, you can uncomment the line below:
-- ALTER TABLE public.assessment_feedback DISABLE ROW LEVEL SECURITY;

-- 3. RESTORE SEARCH_PATH FOR FUNCTIONS (keep security but ensure functionality)
-- Reset search_path to default for functions (this is actually good security practice)
-- The search_path restriction is good security, so we'll keep it

-- 4. VERIFY CRITICAL USER TABLES HAVE PROPER ACCESS
-- Ensure users table and related tables have proper RLS policies

-- Check if users table has proper policies
-- If users table exists and has RLS enabled, ensure it has permissive policies
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        -- Enable RLS if not already enabled
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        -- Drop any restrictive policies
        DROP POLICY IF EXISTS "Users can view own data" ON public.users;
        DROP POLICY IF EXISTS "Users can update own data" ON public.users;
        DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
        
        -- Create permissive policies for authenticated users
        CREATE POLICY "Authenticated users can access users table"
        ON public.users
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
        
        RAISE NOTICE 'Updated users table policies';
    END IF;
END $$;

-- 5. VERIFY ASSESSMENT-RELATED TABLES
-- Ensure assessment tables have proper access

DO $$
DECLARE
    table_name text;
BEGIN
    -- Loop through common assessment table names
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'assessments', 'assessment_users', 'assessment_questions', 
            'assessment_answers', 'assessment_feedback', 'evaluations'
        ])
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name
        ) THEN
            -- Enable RLS if not already enabled
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            
            -- Drop any restrictive policies
            EXECUTE format('DROP POLICY IF EXISTS "Restrictive policy" ON public.%I', table_name);
            EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', table_name, table_name);
            
            -- Create permissive policy for authenticated users
            EXECUTE format('
                CREATE POLICY "Authenticated users can access %I"
                ON public.%I
                FOR ALL
                TO authenticated
                USING (true)
                WITH CHECK (true)
            ', table_name, table_name);
            
            RAISE NOTICE 'Updated % policies', table_name;
        END IF;
    END LOOP;
END $$;

-- 6. GRANT NECESSARY PERMISSIONS
-- Ensure authenticated role has proper permissions

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 7. VERIFY AUTH.UID() FUNCTION EXISTS AND WORKS
-- This is critical for user identification

DO $$
BEGIN
    -- Check if auth.uid() function exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'auth' AND p.proname = 'uid'
    ) THEN
        RAISE WARNING 'auth.uid() function not found - this may cause authentication issues';
    ELSE
        RAISE NOTICE 'auth.uid() function found and available';
    END IF;
END $$;

-- 8. CREATE EMERGENCY BYPASS (if needed)
-- If all else fails, you can temporarily disable RLS on critical tables

-- Uncomment these lines ONLY if the above doesn't work:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.assessments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.assessment_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;

RAISE NOTICE 'RLS reversion complete. Users should now have proper access.';
