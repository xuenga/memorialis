# Résumé du Déploiement des Edge Functions Supabase

## Objectif
Résoudre l'erreur Stripe "Metadata values can have up to 500 characters" en divisant les métadonnées volumineuses (détails des articles) et en les reconstruisant lors de la confirmation de commande et du webhook.

## Fonctions Déployées

### 1. `create-checkout`
- **Modifications :** Ajout de la fonction `splitMetadata` pour diviser les gros objets JSON (comme la liste des articles avec personnalisation) en morceaux de 450 caractères (`items_0`, `items_1`, etc.).
- **Statut :** Déployé avec succès.
- **Sécurité :** `verify_jwt: false` (Endpoint public pour la création de session).

### 2. `confirm-order`
- **Modifications :** Ajout de la fonction `getMetadataItems` pour reconstruire l'objet `items` à partir des morceaux de métadonnées. Remplacement de `JSON.parse(metadata.items)` par cette fonction utilitaire.
- **Statut :** Déployé avec succès.
- **Dépendances :** Inclut `_shared/email.ts` pour l'envoi d'emails.

### 3. `stripe-webhook`
- **Modifications :** Ajout de la fonction `getMetadataItems` pour gérer les webhooks Stripe et reconstruire les données des articles correctement avant de créer la commande et le mémorial.
- **Statut :** Déployé avec succès.
- **Dépendances :** Inclut `_shared/email.ts`.

## Modifications Frontend (Local)
Les fichiers suivants ont été modifiés localement pour améliorer la validation :
- `src/pages/Cart.tsx` : Indication visuelle si un article n'est pas configuré.
- `src/pages/Checkout.tsx` : Redirection vers le panier si des articles non configurés sont présents.
- `src/components/plaque/PlaqueConfigurator.tsx` : Validation plus stricte (photo/message requis).

## Prochaines Étapes pour l'Utilisateur
1. **Tester le flux de commande :** Ajouter un produit, le personnaliser (avec un long message si nécessaire pour tester la limite), et passer commande.
2. **Vérifier les emails :** S'assurer que l'email de confirmation contient bien les détails de personnalisation.
3. **Déployer le Frontend :** Si nécessaire, pousser les modifications frontend vers votre hébergeur (Vercel, Netlify, etc.).
