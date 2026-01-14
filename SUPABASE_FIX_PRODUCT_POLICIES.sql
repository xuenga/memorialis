-- =====================================================
-- Script pour ajouter les politiques RLS manquantes
-- Memorialis - Correction des permissions Product
-- =====================================================
-- 
-- Instructions :
-- 1. Ouvrez votre projet Supabase
-- 2. Allez dans "SQL Editor"
-- 3. Créez une nouvelle requête
-- 4. Copiez-collez ce script
-- 5. Cliquez sur "Run" pour exécuter
-- =====================================================

-- Ajouter les politiques manquantes pour la table Product
-- ATTENTION: Ces politiques donnent un accès complet pour le développement
-- En production, vous devriez restreindre ces accès aux administrateurs uniquement

-- Politique pour INSERT (création de produits)
CREATE POLICY "Enable insert for all users" ON "Product" 
FOR INSERT 
WITH CHECK (true);

-- Politique pour UPDATE (modification de produits)
CREATE POLICY "Enable update for all users" ON "Product" 
FOR UPDATE 
USING (true);

-- Politique pour DELETE (suppression de produits)
CREATE POLICY "Enable delete for all users" ON "Product" 
FOR DELETE 
USING (true);

-- Vérification : afficher toutes les politiques de la table Product
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'Product';
