-- =====================================================
-- Réactivation du code d'accès spécial DEMO
-- =====================================================

UPDATE "Memorial"
SET 
    access_code = 'DEMO',
    is_public = false -- Nécessite l'entrée du code pour le test
WHERE id = 'demo-memorial';

-- Assurer que le QR code pointe aussi vers ce mémorial si besoin
UPDATE "QRCode"
SET memorial_id = 'demo-memorial'
WHERE code = '2601-0001';
