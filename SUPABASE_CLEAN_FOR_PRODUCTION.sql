-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                  NETTOYAGE DE LA BASE DE DONNÉES AVANT PRODUCTION          ║
-- ║                                                                            ║
-- ║  ⚠️  ATTENTION : Ce script va supprimer TOUTES les données de test        ║
-- ║                                                                            ║
-- ║  ✅ CONSERVE :                                                             ║
-- ║     - Le memorial "demo-memorial"                                          ║
-- ║     - Les 4 produits (qr_products)                                         ║
-- ║     - Toutes les structures de tables                                      ║
-- ║                                                                            ║
-- ║  🗑️  SUPPRIME :                                                            ║
-- ║     - Tous les autres memorials (~21)                                      ║
-- ║     - Toutes les commandes (~56)                                           ║
-- ║     - Tous les tributes (~4)                                               ║
-- ║     - Toutes les visites (~71)                                             ║
-- ║     - Les QR codes qui ne sont plus liés                                   ║
-- ║                                                                            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1️⃣  BACKUP : Afficher un résumé avant suppression
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 ÉTAT ACTUEL DE LA BASE DE DONNÉES';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Memorials        : %', (SELECT COUNT(*) FROM "Memorial");
    RAISE NOTICE 'Orders           : %', (SELECT COUNT(*) FROM "Order");
    RAISE NOTICE 'Tributes         : %', (SELECT COUNT(*) FROM "Tribute");
    RAISE NOTICE 'MemorialVisits   : %', (SELECT COUNT(*) FROM "MemorialVisit");
    RAISE NOTICE 'QRCodes          : %', (SELECT COUNT(*) FROM "QRCode");
    RAISE NOTICE 'Products         : %', (SELECT COUNT(*) FROM qr_products);
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2️⃣  SUPPRESSION DES DONNÉES (dans l'ordre des dépendances)
-- ─────────────────────────────────────────────────────────────────────────────

-- Étape 1 : Supprimer les VISITES (dépendent de Memorial)
DELETE FROM "MemorialVisit";
RAISE NOTICE '✅ MemorialVisits supprimés';

-- Étape 2 : Supprimer les TRIBUTES (dépendent de Memorial)
DELETE FROM "Tribute";
RAISE NOTICE '✅ Tributes supprimés';

-- Étape 3 : Supprimer les COMMANDES (aucune dépendance externe critique)
DELETE FROM "Order";
RAISE NOTICE '✅ Orders supprimés';

-- Étape 4 : Supprimer les MEMORIALS (sauf demo-memorial)
DELETE FROM "Memorial"
WHERE id != 'demo-memorial';
RAISE NOTICE '✅ Memorials de test supprimés (demo-memorial conservé)';

-- Étape 5 : Réinitialiser le QRCode DEMO en statut disponible
UPDATE "QRCode"
SET 
    status = 'available',
    memorial_id = NULL,
    order_id = NULL,
    owner_email = NULL,
    reserved_at = NULL,
    activated_at = NULL
WHERE code = 'DEMO';
RAISE NOTICE '✅ QR Code DEMO réinitialisé';

-- Étape 6 : Supprimer tous les autres QR codes (optionnel - à commenter si vous voulez garder votre stock)
-- ATTENTION : Décommentez cette ligne seulement si vous voulez aussi supprimer vos QR codes en stock
-- DELETE FROM "QRCode" WHERE code != 'DEMO';
-- RAISE NOTICE '✅ QR Codes supprimés (DEMO conservé)';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3️⃣  RÉINITIALISATION DU DEMO MEMORIAL
-- ─────────────────────────────────────────────────────────────────────────────

-- Réinitialiser le demo-memorial à un état propre
UPDATE "Memorial"
SET 
    is_activated = false,
    photos = '[]'::jsonb,
    videos = '[]'::jsonb
WHERE id = 'demo-memorial';
RAISE NOTICE '✅ Demo memorial réinitialisé';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4️⃣  AFFICHER LE RÉSUMÉ APRÈS NETTOYAGE
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✨ NETTOYAGE TERMINÉ - NOUVELLE SITUATION';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Memorials        : %', (SELECT COUNT(*) FROM "Memorial");
    RAISE NOTICE 'Orders           : %', (SELECT COUNT(*) FROM "Order");
    RAISE NOTICE 'Tributes         : %', (SELECT COUNT(*) FROM "Tribute");
    RAISE NOTICE 'MemorialVisits   : %', (SELECT COUNT(*) FROM "MemorialVisit");
    RAISE NOTICE 'QRCodes          : %', (SELECT COUNT(*) FROM "QRCode");
    RAISE NOTICE 'Products         : %', (SELECT COUNT(*) FROM qr_products);
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 BASE DE DONNÉES PRÊTE POUR LA PRODUCTION !';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES :';
    RAISE NOTICE '  1. Vérifiez que demo-memorial fonctionne toujours';
    RAISE NOTICE '  2. Testez une nouvelle commande';
    RAISE NOTICE '  3. Vérifiez les politiques RLS (GUIDE_SECURITE_RLS.md)';
    RAISE NOTICE '  4. Activez la protection des mots de passe';
    RAISE NOTICE '';
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5️⃣  VALIDATION : Vérifier que les données essentielles sont toujours là
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    demo_count INTEGER;
    product_count INTEGER;
BEGIN
    -- Vérifier que demo-memorial existe
    SELECT COUNT(*) INTO demo_count FROM "Memorial" WHERE id = 'demo-memorial';
    IF demo_count = 0 THEN
        RAISE EXCEPTION '❌ ERREUR : demo-memorial a été supprimé !';
    END IF;
    
    -- Vérifier que les produits existent
    SELECT COUNT(*) INTO product_count FROM qr_products;
    IF product_count = 0 THEN
        RAISE EXCEPTION '❌ ERREUR : Tous les produits ont été supprimés !';
    END IF;
    
    RAISE NOTICE '✅ VALIDATION OK : demo-memorial et produits conservés';
END $$;

COMMIT;

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                              SCRIPT TERMINÉ                                ║
-- ║                                                                            ║
-- ║  Votre base de données est maintenant propre et prête pour la production   ║
-- ║                                                                            ║
-- ║  ⚠️  Si vous voyez une erreur, exécutez ROLLBACK; pour annuler            ║
-- ║                                                                            ║
-- ╚════════════════════════════════════════════════════════════════════════════╝
