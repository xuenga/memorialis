import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MessageSquare, X, ChevronLeft, ChevronRight, Send, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MemorialData {
  id: string;
  name: string;
  birth_date?: string;
  death_date?: string;
  biography?: string;
  profile_photo?: string;
  cover_photo?: string;
  photos?: string[];
  videos?: any[];
  is_public?: boolean;
  allow_comments?: boolean;
  require_moderation?: boolean;
  access_code?: string;
}

interface TributeData {
  id: string;
  author_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export default function ViewMemorial() {
  const { id: memorialId } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState<MemorialData | null>(null);
  const [tributes, setTributes] = useState<TributeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showTributeForm, setShowTributeForm] = useState(false);
  const [tributeForm, setTributeForm] = useState({
    author_name: '',
    author_email: '',
    relationship: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (memorialId) {
        try {
          // Get current user from auth context (for owner preview)
          const currentUserEmail = authUser?.email || null;

          // Determine if we are looking up by ID (UUID) or Slug
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memorialId);

          console.log('Loading memorial:', { memorialId, isUUID });

          let memorials = [];

          if (isUUID) {
            memorials = await api.entities.Memorial.filter({ id: memorialId });
          } else {
            memorials = await api.entities.Memorial.filter({ slug: memorialId });
          }

          console.log('Memorials found:', memorials);

          if (memorials && memorials.length > 0) {
            const mem = memorials[0];

            // SECURITY CHECK: If not public and user is not owner
            // Allow access if:
            // 1. mem.is_public is not explicitly false (it could be true, null, or undefined)
            // 2. OR the current user is the owner
            const isOwner = currentUserEmail && mem.owner_email &&
              mem.owner_email.toLowerCase() === currentUserEmail.toLowerCase();

            if (mem.is_public === false && !isOwner) {
              console.log('Access denied: Memorial is private and user is not owner');
              setMemorial(null);
            } else {
              setMemorial(mem);

              // Now load tributes using the verified memorial UUID
              const tributesList = await api.entities.Tribute.filter({
                memorial_id: mem.id,
                is_approved: true
              });
              setTributes(Array.isArray(tributesList) ? tributesList : []);
            }
          }

          // Track visit
          // We track the visit if the memorial exists and the visitor is NOT the owner
          if (memorials.length > 0) {
            const mem = memorials[0];
            const isOwner = currentUserEmail && mem.owner_email &&
              mem.owner_email.toLowerCase() === currentUserEmail.toLowerCase();

            if (!isOwner) {
              await api.entities.MemorialVisit.create({
                memorial_id: memorialId,
                device: /mobile/i.test(navigator.userAgent) ? 'mobile' :
                  /tablet/i.test(navigator.userAgent) ? 'tablet' : 'desktop'
              });
            }
          }
        } catch (error) {
          console.error('Visit tracking error:', error);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [memorialId, authUser]);

  const handleSubmitTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tributeForm.author_name || !tributeForm.message) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSending(true);
    try {
      await api.entities.Tribute.create({
        memorial_id: memorialId,
        author_name: tributeForm.author_name,
        message: tributeForm.message,
        is_approved: !memorial?.require_moderation, // Auto-approve if no moderation required
        created_at: new Date().toISOString()
      });

      toast.success(memorial?.require_moderation ? 'Merci ! Votre message sera visible après modération.' : 'Merci pour votre hommage.');
      setShowTributeForm(false);
      setTributeForm({ author_name: '', author_email: '', relationship: '', message: '' });

      // If auto-approved, we might want to refresh the list or let the user know
      if (!memorial?.require_moderation) {
        // Optionnel: Recharger la liste des hommages
      }
    } catch (e) {
      toast.error('Une erreur est survenue');
    }
    setIsSending(false);
  };

  // Theme classique utilisé par défaut - pas de changement de couleurs dynamiques

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-serif text-3xl text-primary mb-4">Mémorial non trouvé ou privé</h1>
          <p className="text-primary/60 mb-8">Ce mémorial n'existe pas ou son propriétaire a restreint sa visibilité.</p>
          <Link to={createPageUrl('Home')}>
            <Button className="btn-primary rounded-full px-8">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allPhotos = memorial.photos || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <div className="relative h-[40vh] lg:h-[60vh] overflow-hidden">
        {memorial.cover_photo ? (
          <img src={memorial.cover_photo} className="w-full h-full object-cover" alt="Couverture" />
        ) : (
          <img src="/images/hero-memorialis.jpg" className="w-full h-full object-cover opacity-50" alt="Couverture" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        {/* Bouton fermer */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 z-20 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors group"
          title="Fermer"
        >
          <X className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 lg:-mt-48 relative z-10">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full border-8 border-background overflow-hidden bg-white shadow-2xl mx-auto">
              {memorial.profile_photo ? (
                <img src={memorial.profile_photo} className="w-full h-full object-cover" alt={memorial.name} />
              ) : (
                <img src="/images/hero-memorialis.jpg" className="w-full h-full object-cover" alt={memorial.name} />
              )}
            </div>
            <div className="absolute bottom-4 right-4 bg-accent w-12 h-12 rounded-full flex items-center justify-center text-primary shadow-lg">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h1 className="font-serif text-4xl lg:text-6xl text-primary mb-4">{memorial.name}</h1>
            <div className="flex items-center justify-center gap-4 text-primary/60 font-medium font-serif text-xl">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {memorial.birth_date ? format(new Date(memorial.birth_date), 'yyyy') : '?'}
                {' - '}
                {memorial.death_date ? format(new Date(memorial.death_date), 'yyyy') : '...'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Biography */}
        <section className="mt-20 bg-white rounded-[3rem] p-8 lg:p-16 shadow-sm">
          <h2 className="font-serif text-2xl lg:text-3xl text-primary mb-8 flex items-center gap-3">
            <div className="w-8 h-1 bg-accent rounded-full" />
            Son Histoire
          </h2>
          <div className="prose prose-stone max-w-none">
            <p className="text-primary/70 text-lg leading-relaxed whitespace-pre-line">
              {memorial.biography || "Une vie de souvenirs et d'amour partagé."}
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="font-serif text-2xl lg:text-3xl text-primary">Galerie de souvenirs</h2>
            <span className="text-sm text-primary/40">{allPhotos.length} photos</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allPhotos.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-primary/10 flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-primary/10 mb-4" />
                <p className="text-primary/40">Aucune photo partagée pour le moment</p>
              </div>
            ) : (
              allPhotos.map((photo: string, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-white"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img src={photo} className="w-full h-full object-cover" alt={`Souvenir ${index + 1}`} />
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Videos */}
        {memorial.videos && memorial.videos.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="font-serif text-2xl lg:text-3xl text-primary">Vidéos de souvenirs</h2>
              <span className="text-sm text-primary/40">{memorial.videos.length} vidéos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {memorial.videos.map((video: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-primary/5 group"
                >
                  <div className="aspect-video bg-black relative">
                    <video
                      src={video.url}
                      className="w-full h-full object-contain"
                      controls
                      poster={memorial.cover_photo}
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  </div>
                  <div className="p-6 lg:p-8">
                    <h3 className="font-serif text-xl text-primary">{video.title || 'Sans titre'}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Tributes */}
        <section className="mt-12">
          <div className="bg-primary rounded-[3rem] p-8 lg:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-8 ${memorial.allow_comments !== false ? 'mb-12' : 'mb-0'} relative z-10`}>
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl mb-4 text-white">Hommages & Témoignages</h2>
                <p className="text-white/60">
                  {memorial.allow_comments !== false
                    ? 'Partagez vos souvenirs et vos pensées'
                    : 'Les hommages sont fermés pour ce mémorial'}
                </p>
              </div>
              {memorial.allow_comments !== false && (
                <Button
                  onClick={() => setShowTributeForm(true)}
                  variant="secondary"
                  className="rounded-full px-8 py-6 text-lg"
                >
                  Laisser un message
                </Button>
              )}
            </div>

            <div className="space-y-8 relative z-10">
              {tributes.length === 0 ? (
                <div className="text-center py-10 text-white/40">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>Soyez le premier à laisser un message</p>
                </div>
              ) : (
                tributes.map((tribute: TributeData, index: number) => (
                  <motion.div
                    key={tribute.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="pb-8 border-b border-white/10 last:border-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif text-accent">
                        {(tribute.author_name && tribute.author_name.length > 0) ? tribute.author_name[0] : 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{tribute.author_name || 'Anonyme'}</p>
                        <p className="text-xs text-white/40">
                          {tribute.created_at ? format(new Date(tribute.created_at), 'dd MMMM yyyy', { locale: fr }) : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg text-white/80 italic leading-relaxed">"{tribute.message || '...'}"</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Tribute Form Modal */}
      <AnimatePresence>
        {showTributeForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTributeForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button
                onClick={() => setShowTributeForm(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-primary" />
              </button>

              <h3 className="font-serif text-3xl text-primary mb-8">Laisser un hommage</h3>

              <form onSubmit={handleSubmitTribute} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Votre nom</Label>
                    <Input
                      required
                      value={tributeForm.author_name}
                      onChange={(e) => setTributeForm({ ...tributeForm, author_name: e.target.value })}
                      className="rounded-xl border-primary/10 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Votre email (privé)</Label>
                    <Input
                      type="email"
                      value={tributeForm.author_email}
                      onChange={(e) => setTributeForm({ ...tributeForm, author_email: e.target.value })}
                      className="rounded-xl border-primary/10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Votre message</Label>
                  <Textarea
                    required
                    value={tributeForm.message}
                    onChange={(e) => setTributeForm({ ...tributeForm, message: e.target.value })}
                    rows={6}
                    className="rounded-2xl border-primary/10"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>
                <Button
                  disabled={isSending}
                  className="w-full btn-primary h-14 rounded-full text-lg gap-2"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Envoyer l'hommage
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black">
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-8 right-8 text-white/60 hover:text-white"
            >
              <X className="w-10 h-10" />
            </button>

            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + allPhotos.length) % allPhotos.length)}
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>

            <img
              src={allPhotos[lightboxIndex]}
              className="max-h-full max-w-full object-contain p-20"
              alt="Lightbox"
            />

            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % allPhotos.length)}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              <ChevronRight className="w-12 h-12" />
            </button>

            <div className="absolute bottom-8 text-white/60 font-medium">
              {lightboxIndex + 1} / {allPhotos.length}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Section - Discret en bas de page */}
      {memorial.access_code && (
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-sm border border-primary/5">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://memorialis.shop/qr/${memorial.access_code}`)}`}
              alt="QR Code mémorial"
              className="w-24 h-24 mx-auto opacity-60 hover:opacity-100 transition-opacity"
            />
            <p className="text-xs text-primary/30 mt-3 font-mono">{memorial.access_code}</p>
          </div>
        </div>
      )}

      {/* Fixed Footer for Mobile */}
      {memorial.allow_comments !== false && (
        <div className="fixed bottom-0 left-0 right-0 p-6 lg:hidden z-50 pointer-events-none">
          <Button
            onClick={() => setShowTributeForm(true)}
            variant="secondary"
            className="w-full h-16 rounded-full text-lg shadow-2xl pointer-events-auto"
          >
            <Heart className="w-6 h-6 mr-2" />
            Laisser un hommage
          </Button>
        </div>
      )}
    </div>
  );
}
