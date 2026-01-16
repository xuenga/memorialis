-- =====================================================
-- Script d'insertion du Mémorial de Démonstration
-- Memorialis - Exemple complet
-- =====================================================

-- Insertion du mémorial "Exemple"
INSERT INTO "Memorial" (
  id,
  name,
  birth_date,
  death_date,
  biography,
  profile_photo,
  cover_photo,
  photos,
  videos,
  allow_comments,
  is_public,
  theme,
  owner_email
) VALUES (
  'demo-memorial',
  'Louis Martin',
  '1945-03-12',
  '2023-11-04',
  'Louis était un homme passionné par la nature et la photographie. Il a passé sa vie à capturer la beauté des paysages de sa Bretagne natale. Père aimant de trois enfants et grand-père comblé, il nous a transmis son amour des choses simples et authentiques.

Ses dimanches étaient sacrés : promenade en forêt le matin et repas en famille le midi. Il avait toujours une histoire à raconter, un sourire à partager. Sa générosité et sa douceur resteront gravées dans nos cœurs à jamais.

"La vie n''est pas d''attendre que les orages passent, c''est d''apprendre à danser sous la pluie." - C''était sa citation préférée, qu''il appliquait chaque jour.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop', -- Photo de profil (Old man)
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop', -- Photo de couverture (Nature/Landscape)
  ARRAY[
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop', -- Family
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop', -- Landscape
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop'  -- Travel
  ],
  '[
    {
      "url": "https://video.bunnycdn.com/play/library/123/videoId/456", 
      "title": "Vacances en Bretagne 2022",
      "type": "file"
    },
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
      "title": "Son morceau de piano préféré",
      "type": "link"
    }
  ]'::jsonb,
  true,
  true,
  'classic',
  'demo@memorialis.shop'
) ON CONFLICT (id) DO NOTHING;

-- Insertion de quelques hommages
INSERT INTO "Tribute" (
  memorial_id,
  author_name,
  message,
  relationship,
  is_approved,
  created_at
) VALUES 
(
  'demo-memorial',
  'Marie Martin',
  'Tu me manques tellement papa. Merci pour tout ce que tu nous as appris. Je garde précieusement tes appareils photo.',
  'Fille',
  true,
  NOW() - INTERVAL '2 days'
),
(
  'demo-memorial',
  'Jean Dupont',
  'Un ami fidèle et un photographe de talent. Nos sorties photo du dimanche vont me manquer mon vieux Louis.',
  'Ami',
  true,
  NOW() - INTERVAL '5 days'
),
(
  'demo-memorial',
  'Sarah L.',
  'Papy Louis, merci pour toutes les histoires. Je t''aime fort.',
  'Petite-fille',
  true,
  NOW() - INTERVAL '1 week'
);
