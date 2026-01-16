-- =====================================================
-- Mise à jour du mémorial DEMO avec le code QR
-- Exécuter APRÈS SUPABASE_LINK_DEMO_QRCODE.sql
-- =====================================================

-- Mettre à jour le mémorial DEMO avec le code d'accès
UPDATE "Memorial"
SET access_code = '2601-0001'
WHERE id = 'demo-memorial';

-- Vérification
SELECT id, name, access_code FROM "Memorial" WHERE id = 'demo-memorial';
