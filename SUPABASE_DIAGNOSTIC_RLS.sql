-- =====================================================
-- Script de diagnostic RLS (Row Level Security)
-- Memorialis - Vérification des politiques
-- =====================================================
-- 
-- Instructions :
-- 1. Ouvrez votre projet Supabase
-- 2. Allez dans "SQL Editor"
-- 3. Créez une nouvelle requête
-- 4. Copiez-collez ce script
-- 5. Cliquez sur "Run" pour exécuter
-- =====================================================

-- Vérifier si RLS est activé sur les tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('Product', 'Memorial', 'Tribute', 'Order', 'CartItem', 'MemorialVisit')
ORDER BY tablename;

-- Afficher toutes les politiques existantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Compter les politiques par table et opération
SELECT 
  tablename,
  cmd as operation,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- Identifier les tables avec RLS activé mais sans politiques complètes
WITH table_rls AS (
  SELECT tablename
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND rowsecurity = true
),
table_policies AS (
  SELECT DISTINCT tablename, cmd
  FROM pg_policies 
  WHERE schemaname = 'public'
)
SELECT 
  t.tablename,
  CASE WHEN p_select.cmd IS NOT NULL THEN '✓' ELSE '✗' END as has_select,
  CASE WHEN p_insert.cmd IS NOT NULL THEN '✓' ELSE '✗' END as has_insert,
  CASE WHEN p_update.cmd IS NOT NULL THEN '✓' ELSE '✗' END as has_update,
  CASE WHEN p_delete.cmd IS NOT NULL THEN '✓' ELSE '✗' END as has_delete
FROM table_rls t
LEFT JOIN table_policies p_select ON t.tablename = p_select.tablename AND p_select.cmd = 'SELECT'
LEFT JOIN table_policies p_insert ON t.tablename = p_insert.tablename AND p_insert.cmd = 'INSERT'
LEFT JOIN table_policies p_update ON t.tablename = p_update.tablename AND p_update.cmd = 'UPDATE'
LEFT JOIN table_policies p_delete ON t.tablename = p_delete.tablename AND p_delete.cmd = 'DELETE'
ORDER BY t.tablename;
