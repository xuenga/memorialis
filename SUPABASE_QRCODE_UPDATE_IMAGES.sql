-- =====================================================
-- MISE À JOUR : Ajout génération d'images QR codes
-- =====================================================
-- 
-- À exécuter dans l'éditeur SQL de Supabase APRÈS le script initial
-- 
-- Utilise l'API gratuite goqr.me pour générer les images
-- =====================================================

-- 1. Ajouter la colonne qr_image_url si elle n'existe pas
ALTER TABLE "QRCode" ADD COLUMN IF NOT EXISTS qr_image_url TEXT;

-- Commentaire
COMMENT ON COLUMN "QRCode".qr_image_url IS 'URL de l''image QR code générée via API goqr.me';

-- 2. Mettre à jour la fonction de génération pour inclure l'URL de l'image
CREATE OR REPLACE FUNCTION generate_qrcodes(
    prefix TEXT,  -- ex: '2601' pour janvier 2026
    quantity INTEGER,
    base_url TEXT DEFAULT 'https://memorialis.shop'  -- URL de base du site
)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
    existing_count INTEGER;
    new_code TEXT;
    redirect_url TEXT;
    qr_image TEXT;
    inserted_count INTEGER := 0;
BEGIN
    -- Trouver le dernier numéro existant pour ce préfixe
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(code, '-', 2) AS INTEGER)
    ), 0)
    INTO existing_count
    FROM "QRCode"
    WHERE code LIKE prefix || '-%';
    
    -- Générer les codes avec leur image QR
    FOR i IN 1..quantity LOOP
        new_code := prefix || '-' || LPAD((existing_count + i)::TEXT, 4, '0');
        
        -- URL de redirection que le QR code pointe
        redirect_url := base_url || '/qr/' || new_code;
        
        -- URL de l'image QR générée via API gratuite goqr.me
        -- Format: haute résolution 1000x1000 pour l'impression
        qr_image := 'https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=' || 
                    replace(replace(redirect_url, ':', '%3A'), '/', '%2F');
        
        INSERT INTO "QRCode" (code, status, qr_image_url, created_at)
        VALUES (new_code, 'available', qr_image, now())
        ON CONFLICT (code) DO NOTHING;
        
        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Mettre à jour les codes existants qui n'ont pas d'image
UPDATE "QRCode"
SET qr_image_url = 'https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=' || 
                   replace(replace('https://memorialis.shop/qr/' || code, ':', '%3A'), '/', '%2F')
WHERE qr_image_url IS NULL;

-- =====================================================
-- Vérification
-- =====================================================

-- Afficher les premiers codes avec leurs images
SELECT code, status, qr_image_url
FROM "QRCode"
ORDER BY created_at DESC
LIMIT 5;
