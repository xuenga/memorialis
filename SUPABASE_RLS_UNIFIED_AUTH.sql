-- ============================================
-- Politiques RLS pour Authentification Unifiée
-- Date: 2026-01-25
-- Description: Politiques de sécurité pour Memorial et Order avec système unifié
-- ============================================

-- Activer RLS sur les tables si pas déjà fait
ALTER TABLE "Memorial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES POUR MEMORIAL
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own memorials" ON "Memorial";
DROP POLICY IF EXISTS "Users can update own memorials" ON "Memorial";
DROP POLICY IF EXISTS "Users can insert own memorials" ON "Memorial";
DROP POLICY IF EXISTS "Admins full access memorials" ON "Memorial";
DROP POLICY IF EXISTS "Public can view memorials" ON "Memorial";

-- 1. Les utilisateurs peuvent voir leurs propres mémoriaux + ceux qu'ils créent via commande
CREATE POLICY "Users can view own memorials" ON "Memorial"
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') = 'admin'
);

-- 2. Les utilisateurs peuvent modifier leurs propres mémoriaux
CREATE POLICY "Users can update own memorials" ON "Memorial"
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() 
  OR owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') = 'admin'
);

-- 3. Seul le système (service role) peut créer des mémoriaux via webhook
-- Les admins peuvent aussi créer manuellement
CREATE POLICY "System and admins can create memorials" ON "Memorial"
FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- 4. Les mémoriaux publics sont visibles par tous (pour ViewMemorial)
CREATE POLICY "Public can view memorials" ON "Memorial"
FOR SELECT TO anon, authenticated
USING (is_activated = true);

-- ============================================
-- POLITIQUES POUR ORDER
-- ============================================

DROP POLICY IF EXISTS "Users can view own orders" ON "Order";
DROP POLICY IF EXISTS "Admins can view all orders" ON "Order";

-- 1. Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders" ON "Order"
FOR SELECT TO authenticated
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') = 'admin'
);

-- 2. Les admins peuvent voir et modifier toutes les commandes
CREATE POLICY "Admins full access orders" ON "Order"
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ============================================
-- POLITIQUES POUR QRCODE
-- ============================================

ALTER TABLE "QRCode" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage QR codes" ON "QRCode";
DROP POLICY IF EXISTS "Users can view their QR codes" ON "QRCode";

-- 1. Les admins peuvent tout faire avec les QR codes
CREATE POLICY "Admins can manage QR codes" ON "QRCode"
FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- 2. Les utilisateurs peuvent voir leurs propres QR codes
CREATE POLICY "Users can view their QR codes" ON "QRCode"
FOR SELECT TO authenticated
USING (
  owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (auth.jwt() ->> 'role') = 'admin'
);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Pour vérifier que les politiques sont actives :
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('Memorial', 'Order', 'QRCode')
-- ORDER BY tablename, policyname;
