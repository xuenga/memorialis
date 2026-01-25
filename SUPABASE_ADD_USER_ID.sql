-- ============================================
-- Migration: Ajout de user_id à Memorial
-- Date: 2026-01-25
-- Description: Ajoute la colonne user_id pour lier les mémoriaux aux comptes utilisateurs
-- ============================================

-- 1. Ajouter la colonne user_id (nullable car mémoriaux existants)
ALTER TABLE "Memorial" 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_memorial_user_id ON "Memorial"(user_id);

-- 3. Créer un index sur owner_email pour la migration
CREATE INDEX IF NOT EXISTS idx_memorial_owner_email ON "Memorial"(owner_email);

-- 4. Ajouter un commentaire pour documenter
COMMENT ON COLUMN "Memorial".user_id IS 'Reference to the Supabase Auth user who owns this memorial';

-- ============================================
-- Script de promotion Admin
-- À exécuter avec votre email personnel
-- ============================================

-- Remplacer 'votre-email@example.com' par votre vrai email
-- Ce script ajoute le rôle 'admin' dans les métadonnées de votre compte

-- IMPORTANT: Exécutez cette commande UNE SEULE FOIS avec votre email
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'votre-email@example.com';

-- Pour vérifier que le rôle a bien été ajouté :
-- SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'votre-email@example.com';

COMMENT ON TABLE "Memorial" IS 'Stores memorial information with owner authentication via user_id';
