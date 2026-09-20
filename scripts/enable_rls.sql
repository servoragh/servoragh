-- Enable Row Level Security (RLS) on all tables in the public schema
-- This immediately resolves Supabase's "Table publicly accessible (rls_disabled_in_public)" critical vulnerability.
-- Since Servora uses Prisma connecting via the `postgres` user, Prisma bypasses RLS and continues working 100% normally.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;
