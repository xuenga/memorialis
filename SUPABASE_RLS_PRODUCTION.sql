-- =====================================================
-- Politiques RLS Sécurisées pour PRODUCTION
-- Memorialis - Configuration de sécurité avancée
-- =====================================================
-- 
-- ⚠️ ATTENTION : Ce script est pour la PRODUCTION uniquement
-- Ne l'exécutez PAS en développement, cela bloquera vos tests
-- 
-- Instructions :
-- 1. Avant de passer en production, créez un système d'authentification
-- 2. Configurez les rôles utilisateurs (admin, user)
-- 3. Puis exécutez ce script dans Supabase
-- =====================================================

-- ============================================
-- ÉTAPE 1 : Supprimer les politiques permissives
-- ============================================

-- Product
DROP POLICY IF EXISTS "Enable insert for all users" ON "Product";
DROP POLICY IF EXISTS "Enable update for all users" ON "Product";
DROP POLICY IF EXISTS "Enable delete for all users" ON "Product";

-- Memorial
DROP POLICY IF EXISTS "Enable insert for all users" ON "Memorial";
DROP POLICY IF EXISTS "Enable update for all users" ON "Memorial";

-- Tribute
DROP POLICY IF EXISTS "Enable insert for all users" ON "Tribute";
DROP POLICY IF EXISTS "Enable update for all users" ON "Tribute";

-- ============================================
-- ÉTAPE 2 : Créer les politiques sécurisées
-- ============================================

-- ========== TABLE: Product ==========
-- Seuls les administrateurs peuvent gérer les produits

-- INSERT : Réservé aux admins
CREATE POLICY "Admins can insert products" ON "Product"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- UPDATE : Réservé aux admins
CREATE POLICY "Admins can update products" ON "Product"
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- DELETE : Réservé aux admins
CREATE POLICY "Admins can delete products" ON "Product"
FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- ========== TABLE: Memorial ==========
-- Les utilisateurs peuvent créer et modifier leurs propres mémoriaux

-- INSERT : Utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create memorials" ON "Memorial"
FOR INSERT
TO authenticated
WITH CHECK (
  owner_email = auth.jwt() ->> 'email'
);

-- UPDATE : Propriétaires et admins peuvent modifier
CREATE POLICY "Owners and admins can update memorials" ON "Memorial"
FOR UPDATE
TO authenticated
USING (
  owner_email = auth.jwt() ->> 'email' 
  OR auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  owner_email = auth.jwt() ->> 'email' 
  OR auth.jwt() ->> 'role' = 'admin'
);

-- DELETE : Propriétaires et admins peuvent supprimer
CREATE POLICY "Owners and admins can delete memorials" ON "Memorial"
FOR DELETE
TO authenticated
USING (
  owner_email = auth.jwt() ->> 'email' 
  OR auth.jwt() ->> 'role' = 'admin'
);

-- ========== TABLE: Tribute ==========
-- Tout le monde peut créer des hommages, seuls les admins peuvent modifier

-- INSERT : Tout le monde peut créer un hommage
CREATE POLICY "Anyone can create tributes" ON "Tribute"
FOR INSERT
WITH CHECK (true);

-- UPDATE : Seuls les admins peuvent modifier (pour modération)
CREATE POLICY "Admins can update tributes" ON "Tribute"
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- DELETE : Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete tributes" ON "Tribute"
FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- ========== TABLE: Order ==========
-- Les utilisateurs peuvent voir et créer leurs propres commandes

-- SELECT : Voir ses propres commandes
CREATE POLICY "Users can view their own orders" ON "Order"
FOR SELECT
TO authenticated
USING (customer_email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin');

-- INSERT : Créer une commande
CREATE POLICY "Users can create orders" ON "Order"
FOR INSERT
TO authenticated
WITH CHECK (customer_email = auth.jwt() ->> 'email');

-- UPDATE : Admins seulement (pour gérer les statuts)
CREATE POLICY "Admins can update orders" ON "Order"
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ========== TABLE: CartItem ==========
-- Les utilisateurs gèrent leur propre panier

-- SELECT : Voir son propre panier
CREATE POLICY "Users can view their cart" ON "CartItem"
FOR SELECT
USING (
  session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
  OR auth.jwt() ->> 'role' = 'admin'
);

-- INSERT : Ajouter au panier
CREATE POLICY "Users can add to cart" ON "CartItem"
FOR INSERT
WITH CHECK (
  session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
);

-- UPDATE : Modifier son panier
CREATE POLICY "Users can update their cart" ON "CartItem"
FOR UPDATE
USING (
  session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
);

-- DELETE : Supprimer de son panier
CREATE POLICY "Users can delete from cart" ON "CartItem"
FOR DELETE
USING (
  session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
);

-- ============================================
-- ÉTAPE 3 : Activer RLS sur toutes les tables
-- ============================================

ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 4 : Vérification
-- ============================================

-- Afficher toutes les politiques
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Configuration des rôles utilisateurs :
--    Vous devez ajouter un champ 'role' dans les métadonnées JWT
--    Exemple dans Supabase Auth :
--    UPDATE auth.users 
--    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--    WHERE email = 'admin@example.com';

-- 2. Pour tester si un utilisateur est admin :
--    SELECT auth.jwt() ->> 'role';

-- 3. Session ID pour le panier :
--    Vous devez passer le session_id dans les claims JWT
--    ou utiliser une autre méthode d'identification de session
