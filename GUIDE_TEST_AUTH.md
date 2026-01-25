# 🚀 Guide de Démarrage Rapide - Authentification

## ⚡ Tester l'Authentification en 5 Minutes

### 1️⃣ Vérifier que le serveur tourne
```bash
npm run dev
```
➡️ Ouvrir http://localhost:5173

---

### 2️⃣ Créer un Compte Utilisateur

1. **Cliquer sur "Connexion"** dans le header (bouton en haut à droite)
2. **Cliquer sur "Créer un compte"** en bas du formulaire
3. **Remplir le formulaire d'inscription :**
   - Nom complet : Votre nom
   - Email : votre.email@example.com
   - Mot de passe : minimum 6 caractères
   - Confirmer le mot de passe
4. **Cliquer sur "Créer mon compte"**
5. ✅ Vous devriez voir un message de succès

> **Note:** Selon la configuration Supabase, vous devrez peut-être confirmer votre email. Vérifiez votre boîte de réception.

---

### 3️⃣ Se Connecter

1. **Aller sur la page de connexion** (si pas déjà connecté)
2. **Entrer vos identifiants :**
   - Email
   - Mot de passe
3. **Cliquer sur "Se connecter"**
4. ✅ Vous devriez être redirigé vers "Mes Mémoriaux"
5. ✅ Votre nom devrait apparaître dans le header

---

### 4️⃣ Vérifier la Protection des Routes

1. **Se déconnecter** (cliquer sur l'icône de déconnexion)
2. **Essayer d'accéder à** : http://localhost:5173/my-memorials
3. ✅ Vous devriez être redirigé vers la page de connexion
4. **Se reconnecter**
5. ✅ Vous devriez être redirigé automatiquement vers "Mes Mémoriaux"

---

### 5️⃣ Tester la Récupération de Mot de Passe

1. **Sur la page de connexion**, cliquer sur "Mot de passe oublié ?"
2. **Entrer votre email**
3. **Cliquer sur "Envoyer le lien de réinitialisation"**
4. ✅ Vérifier votre email pour le lien de réinitialisation

---

## ✅ Checklist Rapide

- [ ] Je peux créer un compte
- [ ] Je peux me connecter
- [ ] Mon nom apparaît dans le header quand je suis connecté
- [ ] Je peux me déconnecter
- [ ] Les pages protégées me redirigent vers login si non connecté
- [ ] Après connexion, je suis redirigé vers la bonne page
- [ ] Le menu mobile fonctionne correctement
- [ ] Je peux demander une réinitialisation de mot de passe

---

## 🔧 Configuration Supabase Nécessaire

### Vérifier vos variables d'environnement
Fichier `.env` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### Activer l'authentification par email
Dans Supabase Dashboard :
1. Aller dans **Authentication** > **Providers**
2. Vérifier que **Email** est activé ✅
3. Configurer les **Email Templates** si nécessaire

---

## 🐛 Problèmes Courants

### ❌ "Supabase credentials not found"
**Solution :** Vérifier le fichier `.env` et redémarrer le serveur

### ❌ "Invalid login credentials"
**Solution :** Vérifier l'email et le mot de passe, ou confirmer l'email si requis

### ❌ Email non reçu
**Solution :** 
- Vérifier les spams
- Vérifier la configuration Email dans Supabase
- Pour les tests, désactiver la confirmation d'email dans Supabase

### ❌ La session ne persiste pas
**Solution :** 
- Vérifier que localStorage fonctionne
- Vider le cache du navigateur
- Vérifier que les cookies ne sont pas bloqués

---

## 📱 Test sur Mobile

1. **Ouvrir le menu** (icône hamburger)
2. **Vérifier que les options de connexion/déconnexion apparaissent**
3. **Tester le flux complet d'authentification**

---

## 🎯 Prochaine Étape

Une fois l'authentification testée et validée, passez à l'**Étape 2** :
👉 Voir `GUIDE_SECURITE_RLS.md` - Section "Étape 2 : Configurer les Rôles"

---

**Durée estimée :** 5-10 minutes  
**Statut :** Prêt pour les tests ✅
