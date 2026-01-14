-- =====================================================
-- Configuration pour ignorer les avertissements RLS en DEV
-- Memorialis - Environnement de développement
-- =====================================================
-- 
-- Ce script documente pourquoi les avertissements RLS sont acceptables
-- en développement et comment les gérer
-- 
-- ⚠️ Ces politiques permissives sont INTENTIONNELLES pour le développement
-- =====================================================

-- ============================================
-- POURQUOI LES POLITIQUES PERMISSIVES EN DEV ?
-- ============================================

-- 1. Facilite les tests sans authentification
-- 2. Permet de développer rapidement les fonctionnalités
-- 3. Évite les blocages lors du développement frontend
-- 4. Les données de développement ne sont pas sensibles

-- ============================================
-- AVERTISSEMENTS SUPABASE ACTUELS (NORMAUX)
-- ============================================

-- ✅ Product: INSERT, UPDATE, DELETE avec USING(true)
--    → Permet de tester l'admin sans authentification
--    → Sera sécurisé en production

-- ✅ Memorial: INSERT, UPDATE avec USING(true)
--    → Permet de créer des mémoriaux de test
--    → Sera sécurisé en production

-- ✅ Tribute: INSERT, UPDATE avec USING(true)
--    → Permet de tester les hommages
--    → Sera sécurisé en production

-- ============================================
-- CHECKLIST AVANT PASSAGE EN PRODUCTION
-- ============================================

-- [ ] 1. Implémenter Supabase Auth
-- [ ] 2. Créer un système de rôles (admin/user)
-- [ ] 3. Exécuter SUPABASE_RLS_PRODUCTION.sql
-- [ ] 4. Tester toutes les fonctionnalités avec authentification
-- [ ] 5. Activer la protection contre les mots de passe compromis
-- [ ] 6. Configurer les variables d'environnement de production
-- [ ] 7. Vérifier que les politiques RLS fonctionnent correctement

-- ============================================
-- ACTIVER LA PROTECTION DES MOTS DE PASSE
-- ============================================

-- Cette configuration se fait dans le Dashboard Supabase :
-- 1. Allez dans "Authentication" > "Policies"
-- 2. Activez "Leaked Password Protection"
-- 3. Configurez les exigences de complexité des mots de passe

-- Ou via SQL (nécessite des privilèges superuser) :
-- UPDATE auth.config 
-- SET password_min_length = 8,
--     password_require_letters = true,
--     password_require_numbers = true,
--     password_require_symbols = true;

-- ============================================
-- VÉRIFICATION DE SÉCURITÉ
-- ============================================

-- Pour vérifier l'état de sécurité actuel :
SELECT 
  tablename,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;

-- Pour voir les politiques permissives :
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual = 'true' OR with_check = 'true' THEN '⚠️ PERMISSIVE'
    ELSE '✅ RESTRICTED'
  END as security_level
FROM pg_policies 
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename;

-- ============================================
-- NOTES POUR L'ÉQUIPE DE DÉVELOPPEMENT
-- ============================================

-- 🟢 EN DÉVELOPPEMENT (maintenant) :
--    - Les avertissements RLS sont NORMAUX et ACCEPTABLES
--    - Ils facilitent le développement et les tests
--    - Aucune action requise pour l'instant

-- 🟡 AVANT LA PRODUCTION :
--    - Implémenter l'authentification Supabase
--    - Exécuter SUPABASE_RLS_PRODUCTION.sql
--    - Tester toutes les fonctionnalités

-- 🔴 EN PRODUCTION :
--    - Les politiques permissives sont DANGEREUSES
--    - Elles doivent être remplacées par des politiques strictes
--    - Utiliser SUPABASE_RLS_PRODUCTION.sql
