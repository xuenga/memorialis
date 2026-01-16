# Guide de déploiement - memorialis.shop

## 1. Build de production ✅
Le build est terminé. Les fichiers sont dans le dossier `dist/`:
- `index.html`
- `assets/` (JS, CSS, images)

## 2. Configuration Hostinger

### Étape 1 : Connexion au panneau d'administration
1. Connectez-vous à [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Sélectionnez votre site **memorialis.shop**

### Étape 2 : Accès au gestionnaire de fichiers
1. Allez dans **Fichiers** → **Gestionnaire de fichiers**
2. Naviguez vers le dossier **public_html**
3. **Supprimez** tous les fichiers existants (ou déplacez-les dans un backup)

### Étape 3 : Upload des fichiers
1. Cliquez sur **Upload** → **Upload fichiers**
2. Sélectionnez TOUS les fichiers du dossier `dist/`:
   - `index.html`
   - Le dossier complet `assets/`
3. Attendez la fin de l'upload

### Alternative via FTP (recommandé pour plus de fichiers)
```
Hôte: ftp.memorialis.shop (ou consultez les paramètres FTP dans hpanel)
Utilisateur: votre email
Mot de passe: votre mot de passe FTP
Dossier distant: /public_html
```

## 3. Configuration .htaccess (IMPORTANT pour React Router)

Créez un fichier `.htaccess` dans `public_html` avec ce contenu :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

Ceci permet à React Router de gérer toutes les routes (sinon les URLs comme `/memorial/demo-memorial` donneront une erreur 404).

## 4. Variables d'environnement

Les variables Supabase sont déjà intégrées dans le build. Si vous devez les changer :
1. Modifiez le fichier `.env` local
2. Refaites un `npm run build`
3. Re-uploadez les fichiers

## 5. DNS (si pas encore configuré)

Dans Hostinger hpanel :
1. **Domaines** → **DNS / Nameservers**
2. Vérifiez que les enregistrements A pointent vers les serveurs Hostinger
3. Le SSL devrait être automatique

## 6. Test final

Après upload :
1. Visitez https://memorialis.shop
2. Testez les routes principales :
   - `/` - Page d'accueil
   - `/products` - Boutique
   - `/memorial/demo-memorial` - Mémorial DEMO
   - `/admin` - Tableau de bord admin
   - `/qr/2601-0001` - Redirection QR code

## Dépannage commun

| Problème | Solution |
|----------|----------|
| Page blanche | Vérifiez la console du navigateur (F12) |
| 404 sur les routes | Vérifiez le fichier `.htaccess` |
| Erreurs API | Vérifiez les variables Supabase dans le build |
| Images manquantes | Vérifiez que le dossier `assets` est bien uploadé |
