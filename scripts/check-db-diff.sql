-- Database Diff Check Script for NOBILIS-IA
-- This script helps identify what's missing in your current database

-- Check if processos table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'processos'
    ) 
    THEN '✅ processos table EXISTS' 
    ELSE '❌ processos table MISSING' 
  END as table_status;

-- Check if users table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    ) 
    THEN '✅ users table EXISTS' 
    ELSE '❌ users table MISSING' 
  END as table_status;

-- Check if audit_logs table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs'
    ) 
    THEN '✅ audit_logs table EXISTS' 
    ELSE '❌ audit_logs table MISSING' 
  END as table_status;

-- Check if custom types exist
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'process_status'
    ) 
    THEN '✅ process_status enum EXISTS' 
    ELSE '❌ process_status enum MISSING' 
  END as enum_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'process_priority'
    ) 
    THEN '✅ process_priority enum EXISTS' 
    ELSE '❌ process_priority enum MISSING' 
  END as enum_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_type 
      WHERE typname = 'process_type'
    ) 
    THEN '✅ process_type enum EXISTS' 
    ELSE '❌ process_type enum MISSING' 
  END as enum_status;

-- Check if RLS is enabled on processos table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'processos'
    ) 
    THEN (
      SELECT 
        CASE 
          WHEN relrowsecurity 
          THEN '✅ RLS ENABLED on processos' 
          ELSE '❌ RLS DISABLED on processos' 
        END
      FROM pg_class 
      WHERE relname = 'processos'
    )
    ELSE '❌ processos table does not exist'
  END as rls_status;

-- Check if policies exist on processos table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_policies 
      WHERE tablename = 'processos'
    ) 
    THEN '✅ RLS policies exist on processos' 
    ELSE '❌ No RLS policies on processos' 
  END as policies_status;

-- List all policies on processos table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'processos';

-- Check if indexes exist on processos table
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'processos';

-- Check if triggers exist on processos table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'processos';

-- Count records in each table
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM public.users
UNION ALL
SELECT 
  'processos' as table_name,
  COUNT(*) as record_count
FROM public.processos
UNION ALL
SELECT 
  'audit_logs' as table_name,
  COUNT(*) as record_count
FROM public.audit_logs;

-- Check if update_updated_at_column function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_proc 
      WHERE proname = 'update_updated_at_column'
    ) 
    THEN '✅ update_updated_at_column function EXISTS' 
    ELSE '❌ update_updated_at_column function MISSING' 
  END as function_status; 