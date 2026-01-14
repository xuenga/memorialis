# 📚 Documentation Supabase - Memorialis

Ce dossier contient toute la documentation et les scripts SQL pour configurer et sécuriser votre base de données Supabase.

---

## 🚀 Démarrage Rapide

### Pour Commencer (Première Installation)

1. **Exécutez** : `SUPABASE_SETUP.sql` dans Supabase SQL Editor
2. **Exécutez** : `SUPABASE_INSERT_PRODUCTS.sql` pour ajouter les produits initiaux
3. **C'est tout !** Vous êtes prêt à développer

---

## 📁 Structure des Fichiers

### 🟢 Scripts de Configuration (À exécuter)

| Fichier | Quand | Description |
|---------|-------|-------------|
| `SUPABASE_SETUP.sql` | ✅ Première installation | Crée toutes les tables et politiques de base |
| `SUPABASE_INSERT_PRODUCTS.sql` | ✅ Après le setup | Ajoute 3 produits de démonstration |
| `SUPABASE_FIX_PRODUCT_POLICIES.sql` | ✅ Si erreurs de permissions | Corrige les politiques RLS manquantes |

### 🔴 Scripts de Production (Plus tard)

| Fichier | Quand | Description |
|---------|-------|-------------|
| `SUPABASE_RLS_PRODUCTION.sql` | 🔒 Avant production | Politiques RLS sécurisées avec authentification |

### 🔍 Scripts de Diagnostic

| Fichier | Quand | Description |
|---------|-------|-------------|
| `SUPABASE_DIAGNOSTIC_RLS.sql` | 🔍 Pour diagnostiquer | Vérifie l'état des politiques RLS |

### 📖 Documentation

| Fichier | Description |
|---------|-------------|
| `RESUME_AVERTISSEMENTS_SUPABASE.md` | ⭐ **COMMENCEZ ICI** - Résumé des avertissements |
| `GUIDE_SECURITE_RLS.md` | Guide complet de sécurité RLS |
| `RESOLUTION_PROBLEMES_PRODUITS.md` | Résolution des problèmes de gestion des produits |
| `SUPABASE_RLS_DEV_NOTES.sql` | Notes sur les politiques en développement |
| `.supabase-lint-ignore` | Avertissements ignorés en dev |

---

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Nouvelle Installation

```bash
1. Ouvrez Supabase SQL Editor
2. Exécutez SUPABASE_SETUP.sql
3. Exécutez SUPABASE_INSERT_PRODUCTS.sql
4. Configurez vos variables d'environnement (.env)
```

### Scénario 2 : Erreurs de Permissions

Si vous ne pouvez pas créer/modifier/supprimer des produits :

```bash
1. Ouvrez Supabase SQL Editor
2. Exécutez SUPABASE_FIX_PRODUCT_POLICIES.sql
3. Testez à nouveau
```

### Scénario 3 : Diagnostic des Politiques

Pour vérifier l'état de vos politiques RLS :

```bash
1. Ouvrez Supabase SQL Editor
2. Exécutez SUPABASE_DIAGNOSTIC_RLS.sql
3. Analysez les résultats
```

### Scénario 4 : Passage en Production

```bash
1. Lisez GUIDE_SECURITE_RLS.md
2. Implémentez l'authentification Supabase
3. Configurez les rôles utilisateurs
4. Exécutez SUPABASE_RLS_PRODUCTION.sql
5. Testez toutes les fonctionnalités
6. Activez la protection des mots de passe
```

---

## 🏗️ Structure de la Base de Données

### Tables Principales

| Table | Description | RLS Activé |
|-------|-------------|------------|
| `Product` | Catalogue de produits | ✅ Oui |
| `Memorial` | Mémoriaux créés | ✅ Oui |
| `Tribute` | Hommages/témoignages | ✅ Oui |
| `Order` | Commandes clients | ✅ Oui |
| `CartItem` | Panier d'achat | ✅ Oui |
| `MemorialVisit` | Statistiques de visites | ✅ Oui |

### Politiques RLS Actuelles (Développement)

**Toutes les tables** ont des politiques **permissives** (`USING (true)`) pour faciliter le développement.

⚠️ **Important** : Ces politiques doivent être remplacées par des politiques strictes avant la production.

---

## 🔐 Sécurité

### En Développement (Maintenant)

- ✅ Politiques permissives pour faciliter les tests
- ✅ Pas d'authentification requise
- ✅ Accès complet à toutes les opérations

### En Production (Plus tard)

- 🔒 Politiques strictes basées sur les rôles
- 🔒 Authentification Supabase requise
- 🔒 Contrôle d'accès granulaire
- 🔒 Protection des mots de passe activée

---

## ⚠️ Avertissements Supabase

Vous verrez probablement ces avertissements dans le linter Supabase :

### `rls_policy_always_true`

**Niveau** : WARN  
**Raison** : Politiques RLS permissives  
**Action** : Normal en dev, corriger avant production

### `auth_leaked_password_protection`

**Niveau** : WARN  
**Raison** : Protection des mots de passe désactivée  
**Action** : Activer dans Supabase Dashboard avant production

📖 **Pour plus de détails** : Lisez `RESUME_AVERTISSEMENTS_SUPABASE.md`

---

## 🔄 Workflow de Développement

### Phase 1 : Setup Initial ✅
```
1. SUPABASE_SETUP.sql
2. SUPABASE_INSERT_PRODUCTS.sql
3. Configuration .env
```

### Phase 2 : Développement ✅
```
- Développer les fonctionnalités
- Tester sans authentification
- Ignorer les avertissements RLS
```

### Phase 3 : Corrections (Si nécessaire) ✅
```
- SUPABASE_FIX_PRODUCT_POLICIES.sql
- SUPABASE_DIAGNOSTIC_RLS.sql
```

### Phase 4 : Pré-Production 🔒
```
1. Implémenter Supabase Auth
2. Configurer les rôles
3. SUPABASE_RLS_PRODUCTION.sql
4. Tests exhaustifs
```

### Phase 5 : Production 🚀
```
1. Activer protection des mots de passe
2. Vérifier toutes les politiques
3. Déploiement
```

---

## 📊 Checklist de Production

Avant de déployer en production, vérifiez :

- [ ] Authentification Supabase implémentée
- [ ] Rôles utilisateurs configurés (admin/user)
- [ ] `SUPABASE_RLS_PRODUCTION.sql` exécuté
- [ ] Protection des mots de passe activée
- [ ] Toutes les fonctionnalités testées avec authentification
- [ ] Variables d'environnement de production configurées
- [ ] Backup de la base de données effectué
- [ ] Monitoring et logs configurés

---

## 🆘 Dépannage

### Problème : Impossible de créer/modifier/supprimer des produits

**Solution** : Exécutez `SUPABASE_FIX_PRODUCT_POLICIES.sql`

### Problème : Avertissements RLS dans le linter

**Solution** : Normal en dev, lisez `RESUME_AVERTISSEMENTS_SUPABASE.md`

### Problème : Erreur "Supabase is not configured"

**Solution** : Vérifiez vos variables d'environnement dans `.env`

### Problème : Besoin de diagnostiquer les politiques

**Solution** : Exécutez `SUPABASE_DIAGNOSTIC_RLS.sql`

---

## 🔗 Ressources Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Sécurité des Mots de Passe](https://supabase.com/docs/guides/auth/password-security)

---

## 📝 Notes

- Les scripts SQL sont idempotents (peuvent être exécutés plusieurs fois)
- Toujours faire un backup avant d'exécuter des scripts en production
- Les politiques permissives sont intentionnelles en développement
- Consultez la documentation avant de modifier les politiques RLS

---

**Dernière mise à jour** : 2026-01-12  
**Version** : 1.0  
**Statut** : Développement
