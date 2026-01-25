# Guide de Sécurité RLS - Supabase

## 🎯 Comprendre les Avertissements

Vous avez reçu **7 avertissements** du linter Supabase. C'est **NORMAL** et **ATTENDU** pour un environnement de développement.

### 📊 Résumé des Avertissements

| Table | Opération | Niveau | Statut en DEV |
|-------|-----------|--------|---------------|
| Product | INSERT | ⚠️ WARN | ✅ Acceptable |
| Product | UPDATE | ⚠️ WARN | ✅ Acceptable |
| Product | DELETE | ⚠️ WARN | ✅ Acceptable |
| Memorial | INSERT | ⚠️ WARN | ✅ Acceptable |
| Memorial | UPDATE | ⚠️ WARN | ✅ Acceptable |
| Tribute | INSERT | ⚠️ WARN | ✅ Acceptable |
| Tribute | UPDATE | ⚠️ WARN | ✅ Acceptable |
| Auth | Password Protection | ⚠️ WARN | ⚠️ À configurer |

---

## 🟢 Environnement de DÉVELOPPEMENT (Actuel)

### ✅ Pourquoi les politiques permissives sont OK maintenant

1. **Facilite les tests** : Pas besoin de s'authentifier à chaque fois
2. **Développement rapide** : Vous pouvez tester toutes les fonctionnalités
3. **Données non sensibles** : Les données de dev ne sont pas critiques
4. **Itération rapide** : Vous pouvez créer/modifier/supprimer librement

### 🎯 Action Requise : AUCUNE

Les avertissements sont **informatifs** et vous rappellent de sécuriser avant la production. Vous pouvez continuer à développer normalement.

---

## 🔴 Environnement de PRODUCTION (Futur)

### ⚠️ Pourquoi les politiques permissives sont DANGEREUSES

1. **Accès non autorisé** : N'importe qui peut modifier/supprimer des données
2. **Perte de données** : Risque de suppression accidentelle ou malveillante
3. **Violation de confidentialité** : Accès à des données privées
4. **Non-conformité** : Problèmes légaux (RGPD, etc.)

### 🛡️ Solution : Politiques RLS Sécurisées

J'ai créé le fichier **`SUPABASE_RLS_PRODUCTION.sql`** qui contient :

#### Pour la table **Product** :
```sql
-- Seuls les admins peuvent gérer les produits
CREATE POLICY "Admins can insert products" ON "Product"
FOR INSERT TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

#### Pour la table **Memorial** :
```sql
-- Les utilisateurs gèrent leurs propres mémoriaux
CREATE POLICY "Owners can update memorials" ON "Memorial"
FOR UPDATE TO authenticated
USING (owner_email = auth.jwt() ->> 'email');
```

#### Pour la table **Tribute** :
```sql
-- Tout le monde peut créer, seuls les admins modifient
CREATE POLICY "Anyone can create tributes" ON "Tribute"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update tributes" ON "Tribute"
FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📋 Checklist de Passage en Production

### Étape 1 : Implémenter l'Authentification

- [x] Configurer Supabase Auth dans votre application
- [x] Créer les pages de login/signup
- [x] Implémenter la gestion de session
- [x] Tester le flux d'authentification

### Étape 2 : Configurer les Rôles

- [ ] Définir les rôles (admin, user)
- [ ] Ajouter le champ `role` dans les métadonnées JWT
- [ ] Créer au moins un compte admin

```sql
-- Exemple : Promouvoir un utilisateur en admin
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'votre-email@example.com';
```

### Étape 3 : Appliquer les Politiques de Production

- [ ] Sauvegarder la base de données actuelle
- [ ] Exécuter `SUPABASE_RLS_PRODUCTION.sql`
- [ ] Vérifier que les politiques sont appliquées

### Étape 4 : Tester Toutes les Fonctionnalités

- [ ] Tester la création de produits (en tant qu'admin)
- [ ] Tester la modification de produits (en tant qu'admin)
- [ ] Tester la suppression de produits (en tant qu'admin)
- [ ] Tester la création de mémoriaux (en tant qu'utilisateur)
- [ ] Tester que les non-admins ne peuvent PAS modifier les produits
- [ ] Tester que les utilisateurs ne peuvent modifier QUE leurs mémoriaux

### Étape 5 : Sécurité Supplémentaire

- [ ] Activer "Leaked Password Protection" dans Supabase
- [ ] Configurer la complexité des mots de passe
- [ ] Activer l'authentification à deux facteurs (optionnel)
- [ ] Configurer les limites de taux (rate limiting)

---

## 🔧 Configuration de la Protection des Mots de Passe

### Via le Dashboard Supabase

1. Allez dans **Authentication** > **Settings**
2. Trouvez **"Password Settings"**
3. Activez **"Leaked Password Protection"**
4. Configurez :
   - Longueur minimale : 8 caractères
   - Exiger des lettres : ✅
   - Exiger des chiffres : ✅
   - Exiger des symboles : ✅

---

## 📁 Fichiers de Référence

### Pour le Développement (Maintenant)
- ✅ `SUPABASE_SETUP.sql` - Configuration initiale avec politiques permissives
- ✅ `SUPABASE_FIX_PRODUCT_POLICIES.sql` - Correction des politiques manquantes
- ✅ `SUPABASE_RLS_DEV_NOTES.sql` - Notes sur les avertissements en dev

### Pour la Production (Plus tard)
- 🔒 `SUPABASE_RLS_PRODUCTION.sql` - Politiques sécurisées pour la production
- 🔍 `SUPABASE_DIAGNOSTIC_RLS.sql` - Outil de diagnostic des politiques

---

## 🎓 Ressources Supplémentaires

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide des Politiques RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Sécurité des Mots de Passe](https://supabase.com/docs/guides/auth/password-security)
- [Linter Database](https://supabase.com/docs/guides/database/database-linter)

---

## 💡 Résumé

### 🟢 Maintenant (Développement)
- ✅ Les avertissements sont **normaux**
- ✅ Aucune action requise
- ✅ Continuez à développer normalement

### 🔴 Avant la Production
- ⚠️ Implémenter l'authentification
- ⚠️ Configurer les rôles
- ⚠️ Exécuter `SUPABASE_RLS_PRODUCTION.sql`
- ⚠️ Tester exhaustivement

### 🎯 Conseil
Gardez les politiques permissives pendant le développement, et passez aux politiques strictes **juste avant** le déploiement en production. Cela vous fera gagner beaucoup de temps !
