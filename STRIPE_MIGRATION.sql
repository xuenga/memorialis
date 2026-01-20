-- Script pour ajouter les colonnes Stripe à la table Product existante
-- À exécuter sur Supabase pour les bases de données déjà créées

-- Ajouter les colonnes Stripe si elles n'existent pas
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Product' 
AND column_name IN ('stripe_product_id', 'stripe_price_id');
