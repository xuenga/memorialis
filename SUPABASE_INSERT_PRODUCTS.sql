-- =====================================================
-- Script d'insertion des produits de base
-- Memorialis - Catalogue initial
-- =====================================================
-- 
-- Instructions :
-- 1. Ouvrez votre projet Supabase
-- 2. Allez dans "SQL Editor"
-- 3. Créez une nouvelle requête
-- 4. Copiez-collez ce script
-- 5. Cliquez sur "Run" pour exécuter
-- =====================================================

-- Insertion des 3 produits de base
INSERT INTO "Product" (
  name,
  slug,
  description,
  long_description,
  price,
  material,
  dimensions,
  category,
  image_url,
  features,
  is_active,
  created_at
) VALUES 
(
  'QRcode sur Plaque Autocollante Premium',
  'plaque-autocollante-premium',
  'Facile à installer sur toute surface lisse. Résistante aux intempéries et aux UV.',
  'Notre plaque autocollante premium est la solution idéale pour créer un mémorial durable et élégant. Fabriquée avec des matériaux de haute qualité, elle résiste aux intempéries et conserve son éclat pendant des années. Le QR code gravé permet un accès instantané au mémorial numérique depuis n''importe quel smartphone.',
  49.00,
  'autocollant',
  '8 x 8 cm',
  'plaques',
  'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png',
  ARRAY['Résistant aux UV', 'Étanche', 'Installation facile', 'Garantie 2 ans'],
  true,
  NOW()
),
(
  'QRcode sur Gravure Plexiglass Élégance',
  'gravure-plexiglass-elegance',
  'Design moderne et transparent pour un rendu unique et sophistiqué.',
  'La plaque en plexiglass offre une esthétique contemporaine et raffinée. Sa transparence élégante s''intègre harmonieusement à tout environnement. Le QR code est gravé au laser pour une précision parfaite et une durabilité exceptionnelle. Idéale pour les intérieurs comme les extérieurs protégés.',
  89.00,
  'plexiglass',
  '10 x 10 cm',
  'plaques',
  'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png',
  ARRAY['Gravure laser haute précision', 'Matériau premium', 'Design moderne', 'Résistant aux rayures', 'Garantie 3 ans'],
  true,
  NOW()
),
(
  'QRcode sur Plaque Métal Éternité',
  'plaque-metal-eternite',
  'Robuste et intemporelle, parfaite pour l''extérieur. Résistance maximale.',
  'Notre plaque en métal représente le summum de la durabilité. Conçue pour résister aux conditions les plus extrêmes, elle est idéale pour une installation en extérieur. Le QR code est gravé en profondeur et traité contre la corrosion. Un choix éternel pour honorer la mémoire de vos proches.',
  129.00,
  'metal',
  '12 x 12 cm',
  'plaques',
  'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png',
  ARRAY['Acier inoxydable', 'Traitement anti-corrosion', 'Gravure profonde', 'Résistance extrême', 'Garantie à vie'],
  true,
  NOW()
);

-- Vérification : afficher les produits insérés
SELECT 
  id,
  name,
  price,
  material,
  is_active
FROM "Product"
ORDER BY price ASC;
