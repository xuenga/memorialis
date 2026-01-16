-- =====================================================
-- Table QRCode pour les codes pré-gravés
-- Memorialis - Système d'activation au premier scan
-- =====================================================
-- 
-- À exécuter dans l'éditeur SQL de Supabase
-- 
-- Format des codes : AAMM-XXXX (ex: 2601-0001)
-- Statuts : available → reserved → activated
-- =====================================================

-- Créer la table QRCode (compatible avec les types TEXT des tables existantes)
CREATE TABLE IF NOT EXISTS "QRCode" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'activated')),
    memorial_id TEXT,  -- Type TEXT pour compatibilité avec Memorial.id
    order_id TEXT,     -- Type TEXT pour compatibilité avec Order.id
    owner_email TEXT,
    reserved_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Commentaires pour documentation
COMMENT ON TABLE "QRCode" IS 'Codes QR pré-gravés pour les plaques mémorielles';
COMMENT ON COLUMN "QRCode".code IS 'Code unique format AAMM-XXXX';
COMMENT ON COLUMN "QRCode".status IS 'available = en stock, reserved = acheté, activated = premier scan effectué';

-- Index pour recherche rapide par code
CREATE INDEX IF NOT EXISTS idx_qrcode_code ON "QRCode"(code);
CREATE INDEX IF NOT EXISTS idx_qrcode_status ON "QRCode"(status);
CREATE INDEX IF NOT EXISTS idx_qrcode_owner_email ON "QRCode"(owner_email);
CREATE INDEX IF NOT EXISTS idx_qrcode_memorial_id ON "QRCode"(memorial_id);

-- =====================================================
-- Politiques RLS (Row Level Security)
-- =====================================================

ALTER TABLE "QRCode" ENABLE ROW LEVEL SECURITY;

-- Lecture publique (nécessaire pour la redirection /qr/:code)
DROP POLICY IF EXISTS "Public read QRCode" ON "QRCode";
CREATE POLICY "Public read QRCode" ON "QRCode"
FOR SELECT USING (true);

-- Insertion réservée aux utilisateurs authentifiés (admins via interface)
DROP POLICY IF EXISTS "Authenticated insert QRCode" ON "QRCode";
CREATE POLICY "Authenticated insert QRCode" ON "QRCode"
FOR INSERT TO authenticated
WITH CHECK (true);

-- Mise à jour : utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated update QRCode" ON "QRCode";
CREATE POLICY "Authenticated update QRCode" ON "QRCode"
FOR UPDATE TO authenticated
USING (true);

-- Suppression : utilisateurs authentifiés (seulement codes disponibles)
DROP POLICY IF EXISTS "Authenticated delete QRCode" ON "QRCode";
CREATE POLICY "Authenticated delete QRCode" ON "QRCode"
FOR DELETE TO authenticated
USING (status = 'available');

-- =====================================================
-- Permettre l'accès anonyme pour l'activation (anon key)
-- =====================================================

-- Les utilisateurs non authentifiés peuvent mettre à jour le statut
-- (pour l'activation au premier scan)
DROP POLICY IF EXISTS "Anon update QRCode for activation" ON "QRCode";
CREATE POLICY "Anon update QRCode for activation" ON "QRCode"
FOR UPDATE TO anon
USING (status = 'reserved');

-- =====================================================
-- Fonction pour générer des codes en lot
-- =====================================================

CREATE OR REPLACE FUNCTION generate_qrcodes(
    prefix TEXT,  -- ex: '2601' pour janvier 2026
    quantity INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
    existing_count INTEGER;
    new_code TEXT;
    inserted_count INTEGER := 0;
BEGIN
    -- Trouver le dernier numéro existant pour ce préfixe
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(code, '-', 2) AS INTEGER)
    ), 0)
    INTO existing_count
    FROM "QRCode"
    WHERE code LIKE prefix || '-%';
    
    -- Générer les codes
    FOR i IN 1..quantity LOOP
        new_code := prefix || '-' || LPAD((existing_count + i)::TEXT, 4, '0');
        
        INSERT INTO "QRCode" (code, status, created_at)
        VALUES (new_code, 'available', now())
        ON CONFLICT (code) DO NOTHING;
        
        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemple d'utilisation :
-- SELECT generate_qrcodes('2601', 100);
-- Génère 2601-0001 à 2601-0100

-- =====================================================
-- Vérification
-- =====================================================

-- Afficher la structure de la table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'QRCode'
ORDER BY ordinal_position;
