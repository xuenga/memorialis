-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║              SUPPRESSION DES TABLES INUTILISÉES - PRODUCTION              ║
-- ║                                                                            ║
-- ║  ⚠️  ATTENTION : Ce script va SUPPRIMER des tables entières               ║
-- ║                                                                            ║
-- ║  🗑️  SUPPRIME LES TABLES SUIVANTES :                                      ║
-- ║     ❌ profiles             (jamais utilisée)                              ║
-- ║     ❌ user_qr_codes        (jamais utilisée)                              ║
-- ║     ❌ profile_comments     (jamais utilisée)                              ║
-- ║     ❌ profile_media        (jamais utilisée)                              ║
-- ║     ❌ orders               (doublon avec Order)                           ║
-- ║     ❌ qr_products          (remplacée par Product)                        ║
-- ║                                                                            ║
-- ║  ✅ CONSERVE LES TABLES UTILISÉES :                                        ║
-- ║     - Memorial                                                             ║
-- ║     - Order (avec O majuscule)                                             ║
-- ║     - CartItem                                                             ║
-- ║     - Product                                                              ║
-- ║     - Tribute                                                              ║
-- ║     - MemorialVisit                                                        ║
-- ║     - QRCode                                                               ║
-- ║                                                                            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1️⃣  AFFICHER L'ÉTAT ACTUEL
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 ÉTAT ACTUEL DE LA BASE DE DONNÉES';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Nombre total de tables : %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables à SUPPRIMER (6) :';
    RAISE NOTICE '  ❌ profiles';
    RAISE NOTICE '  ❌ user_qr_codes';
    RAISE NOTICE '  ❌ profile_comments';
    RAISE NOTICE '  ❌ profile_media';
    RAISE NOTICE '  ❌ orders (doublon)';
    RAISE NOTICE '  ❌ qr_products (obsolète)';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables à CONSERVER (7) :';
    RAISE NOTICE '  ✅ Memorial';
    RAISE NOTICE '  ✅ Order';
    RAISE NOTICE '  ✅ CartItem';
    RAISE NOTICE '  ✅ Product';
    RAISE NOTICE '  ✅ Tribute';
    RAISE NOTICE '  ✅ MemorialVisit';
    RAISE NOTICE '  ✅ QRCode';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2️⃣  SUPPRIMER LES TABLES (dans l'ordre des dépendances)
-- ─────────────────────────────────────────────────────────────────────────────

-- Étape 1 : Supprimer user_qr_codes (peut avoir des foreign keys)
DROP TABLE IF EXISTS user_qr_codes CASCADE;
RAISE NOTICE '✅ Table "user_qr_codes" supprimée';

-- Étape 2 : Supprimer profile_comments
DROP TABLE IF EXISTS profile_comments CASCADE;
RAISE NOTICE '✅ Table "profile_comments" supprimée';

-- Étape 3 : Supprimer profile_media
DROP TABLE IF EXISTS profile_media CASCADE;
RAISE NOTICE '✅ Table "profile_media" supprimée';

-- Étape 4 : Supprimer profiles (peut être référencée par auth.users)
DROP TABLE IF EXISTS profiles CASCADE;
RAISE NOTICE '✅ Table "profiles" supprimée';

-- Étape 5 : Supprimer orders (doublon avec Order)
DROP TABLE IF EXISTS orders CASCADE;
RAISE NOTICE '✅ Table "orders" (doublon) supprimée';

-- Étape 6 : Supprimer qr_products (remplacée par Product)
DROP TABLE IF EXISTS qr_products CASCADE;
RAISE NOTICE '✅ Table "qr_products" (obsolète) supprimée';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3️⃣  AFFICHER LE RÉSUMÉ APRÈS SUPPRESSION
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    table_count INTEGER;
    table_list TEXT;
BEGIN
    -- Compter les tables restantes
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- Lister les tables restantes
    SELECT string_agg('  ✅ ' || table_name, E'\n' ORDER BY table_name)
    INTO table_list
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✨ NETTOYAGE TERMINÉ - NOUVELLE SITUATION';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Nombre de tables restantes : %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables actives :';
    RAISE NOTICE '%', table_list;
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 BASE DE DONNÉES NETTOYÉE !';
    RAISE NOTICE '✅ 6 tables inutilisées supprimées';
    RAISE NOTICE '✅ % tables essentielles conservées', table_count;
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES :';
    RAISE NOTICE '  1. Vérifiez que votre site fonctionne toujours';
    RAISE NOTICE '  2. Testez toutes les fonctionnalités principales';
    RAISE NOTICE '  3. Vérifiez les politiques RLS';
    RAISE NOTICE '';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4️⃣  VALIDATION : Vérifier que les tables essentielles sont toujours là
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    memorial_exists BOOLEAN;
    order_exists BOOLEAN;
    product_exists BOOLEAN;
    missing_tables TEXT := '';
BEGIN
    -- Vérifier Memorial
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Memorial'
    ) INTO memorial_exists;
    
    -- Vérifier Order
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Order'
    ) INTO order_exists;
    
    -- Vérifier Product
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Product'
    ) INTO product_exists;
    
    -- Construire la liste des tables manquantes
    IF NOT memorial_exists THEN
        missing_tables := missing_tables || 'Memorial, ';
    END IF;
    
    IF NOT order_exists THEN
        missing_tables := missing_tables || 'Order, ';
    END IF;
    
    IF NOT product_exists THEN
        missing_tables := missing_tables || 'Product, ';
    END IF;
    
    -- Vérifier si des tables essentielles sont manquantes
    IF missing_tables != '' THEN
        RAISE EXCEPTION '❌ ERREUR CRITIQUE : Tables essentielles manquantes : %', 
            rtrim(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE '✅ VALIDATION OK : Toutes les tables essentielles sont présentes';
END $$;

COMMIT;

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                              SCRIPT TERMINÉ                                ║
-- ║                                                                            ║
-- ║  Votre base de données est maintenant optimisée pour la production         ║
-- ║  Plus de tables inutilisées = meilleure performance et sécurité            ║
-- ║                                                                            ║
-- ║  ⚠️  Si vous voyez une erreur, exécutez ROLLBACK; pour annuler            ║
-- ║                                                                            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝
