-- =====================================================
-- Correction du schéma Supabase
-- Ajout des colonnes manquantes pour éviter les crashs
-- =====================================================

-- Table Memorial
ALTER TABLE "Memorial" 
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT now();

-- Table MemorialVisit
ALTER TABLE "MemorialVisit"
ADD COLUMN IF NOT EXISTS device TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Ajout d'index pour les performances
CREATE INDEX IF NOT EXISTS idx_memorial_visit_device ON "MemorialVisit"(device);
CREATE INDEX IF NOT EXISTS idx_memorial_visit_memorial_id ON "MemorialVisit"(memorial_id);

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('Memorial', 'MemorialVisit');
