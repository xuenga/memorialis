import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Save, Eye, User, FileText, MessageSquare, Settings,
  Trash2, Check, Eye as EyeIcon, Share2, BarChart3, Palette,
  Image as ImageIcon, Plus, Video
} from 'lucide-react';
import { Button, Input, Textarea, Label, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { toast } from 'sonner';
import MediaUploader from '@/components/memorial/MediaUploader';
import StatsCard from '@/components/memorial/StatsCard';
import ThemeSelector from '@/components/memorial/ThemeSelector';
import ShareModal from '@/components/memorial/ShareModal';

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
  theme?: string;
  is_public?: boolean;
  allow_comments?: boolean;
  require_moderation?: boolean;
  access_code?: string;
  slug?: string;
  custom_colors?: {
    primary?: string;
    accent?: string;
    bg?: string;
  };
}

// Helper to slugify text
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

interface TributeData {
  id: string;
  author_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export default function EditMemorial() {
  const { id: memorialId } = useParams<{ id: string }>();
  const [memorial, setMemorial] = useState<MemorialData | null>(null);
  const [tributes, setTributes] = useState<TributeData[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (memorialId) {
        try {
          const memorials = await api.entities.Memorial.filter({ id: memorialId });
          if (memorials && memorials.length > 0) {
            setMemorial(memorials[0]);
          }

          const tributesList = await api.entities.Tribute.filter({ memorial_id: memorialId });
          setTributes(Array.isArray(tributesList) ? tributesList : []);

          const visitsList = await api.entities.MemorialVisit.filter({ memorial_id: memorialId });
          setVisits(Array.isArray(visitsList) ? visitsList : []);
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [memorialId]);

  const handleSave = async () => {
    if (!memorialId || !memorial) return;
    setIsSaving(true);
    try {
      await api.entities.Memorial.update(memorialId, memorial);
      toast.success('Mémorial sauvegardé !');
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    }
    setIsSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !memorial) return;

    try {
      const loadingToast = toast.loading('Téléchargement de la photo...');

      const uploadFolder = memorialId ? `memorials/${memorialId}` : 'memorials';
      const file_url = await api.storage.upload(file, uploadFolder);

      if (type === 'profile') {
        setMemorial(prev => prev ? { ...prev, profile_photo: file_url } : null);
      } else if (type === 'cover') {
        setMemorial(prev => prev ? { ...prev, cover_photo: file_url } : null);
      } else if (type === 'gallery') {
        setMemorial(prev => {
          if (!prev) return null;
          const photos = prev.photos || [];
          return { ...prev, photos: [...photos, file_url] };
        });
      }

      toast.dismiss(loadingToast);
      toast.success('Photo téléchargée !');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erreur: ${error.message || 'Problème de configuration'}`);
    }
  };

  const handleVideoUpload = (videoData: any) => {
    setMemorial(prev => {
      if (!prev) return null;
      const videos = prev.videos || [];
      return { ...prev, videos: [...videos, videoData] };
    });
    toast.success('Vidéo ajoutée !');
  };

  const removeVideo = (index: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return;
    setMemorial(prev => {
      if (!prev) return null;
      const videos = [...(prev.videos || [])];
      videos.splice(index, 1);
      return { ...prev, videos };
    });
  };

  const removePhoto = (index: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return;
    setMemorial(prev => {
      if (!prev) return null;
      const photos = [...(prev.photos || [])];
      photos.splice(index, 1);
      return { ...prev, photos };
    });
  };

  const approveTribute = async (tribute: TributeData) => {
    await api.entities.Tribute.update(tribute.id, { is_approved: true });
    setTributes(tributes.map(t => t.id === tribute.id ? { ...t, is_approved: true } : t));
    toast.success('Témoignage approuvé');
  };

  const deleteTribute = async (tribute: TributeData) => {
    if (!confirm('Voulez-vous vraiment supprimer ce témoignage ?')) return;
    await api.entities.Tribute.delete(tribute.id);
    setTributes(tributes.filter(t => t.id !== tribute.id));
    toast.success('Témoignage supprimé');
  };

  // Update slug when name changes if slug is empty or matches previous auto-generated slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setMemorial(prev => {
      if (!prev) return null;

      const updates: Partial<MemorialData> = { name: newName };

      // Auto-generate slug if it's empty or looks like an auto-generated one
      if (!prev.slug || prev.slug === slugify(prev.name)) {
        updates.slug = slugify(newName);
      }

      return { ...prev, ...updates };
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = slugify(e.target.value);
    setMemorial(prev => prev ? { ...prev, slug: newSlug } : null);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-primary mb-4">Mémorial non trouvé</h1>
          <Link to={createPageUrl('MyMemorials')}>
            <Button className="btn-accent rounded-full text-primary">Retour à mes mémoriaux</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            to={createPageUrl('MyMemorials')}
            className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Mes mémoriaux
          </Link>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              className="rounded-full border-primary/20 gap-2 h-12 px-8 shadow-sm font-bold uppercase tracking-widest text-xs"
            >
              <Share2 className="w-4 h-4 text-accent" />
              Partager
            </Button>
            <Link to={createPageUrl('ViewMemorial', { id: memorialId || '' })}>
              <Button variant="outline" className="rounded-full border-primary/20 gap-2 h-12 px-8 shadow-sm font-bold uppercase tracking-widest text-xs">
                <Eye className="w-4 h-4 text-accent" />
                Aperçu
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="secondary"
              className="rounded-full gap-2 h-12 px-10 shadow-lg shadow-accent/20 font-bold uppercase tracking-widest text-xs"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-primary/5"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full border-b border-primary/5 p-2 h-auto rounded-none bg-background/50 backdrop-blur-sm">
              <div className="flex overflow-x-auto no-scrollbar gap-1">
                {[
                  { value: 'info', icon: User, label: 'Général' },
                  { value: 'media', icon: ImageIcon, label: 'Photos' },
                  { value: 'bio', icon: FileText, label: 'Bio' },
                  { value: 'tributes', icon: MessageSquare, label: 'Messages' },
                  { value: 'stats', icon: BarChart3, label: 'Stats' },
                  { value: 'settings', icon: Settings, label: 'Réglages' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 min-w-[100px] py-3 px-4 rounded-2xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-primary/40 font-bold text-xs uppercase tracking-widest gap-2"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            <div className="p-8 lg:p-12">
              {/* Info Tab */}
              <TabsContent value="info" className="mt-0 space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Identité</Label>
                      <Input
                        value={memorial.name || ''}
                        onChange={handleNameChange}
                        placeholder="Prénom et Nom"
                        className="h-14 rounded-2xl border-primary/10 focus:border-accent px-6 text-lg font-serif"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Lien personnalisé</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary/40 select-none">memorialis.shop/memorial/</span>
                        <Input
                          value={memorial.slug || ''}
                          onChange={handleSlugChange}
                          placeholder="prenom-nom"
                          className="h-10 rounded-xl border-primary/10 focus:border-accent px-4 font-mono text-sm"
                        />
                      </div>
                      <p className="text-[10px] text-primary/40 italic">Ce lien personnalisé sera utilisable pour partager le mémorial.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Naissance</Label>
                        <Input
                          type="date"
                          value={memorial.birth_date || ''}
                          onChange={(e) => setMemorial(prev => prev ? { ...prev, birth_date: e.target.value } : null)}
                          className="h-14 rounded-2xl border-primary/10 focus:border-accent px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Décès</Label>
                        <Input
                          type="date"
                          value={memorial.death_date || ''}
                          onChange={(e) => setMemorial(prev => prev ? { ...prev, death_date: e.target.value } : null)}
                          className="h-14 rounded-2xl border-primary/10 focus:border-accent px-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Photo de couverture</Label>
                    <div className="relative group aspect-[16/9] rounded-3xl overflow-hidden bg-background border-2 border-dashed border-primary/10">
                      {memorial.cover_photo ? (
                        <img src={memorial.cover_photo} className="w-full h-full object-cover" alt="Couverture" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <ImageIcon className="w-10 h-10 text-primary/10" />
                          <p className="text-xs text-primary/20 uppercase tracking-widest font-bold">Ajouter un paysage</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="cover-upload"
                        onChange={(e) => handlePhotoUpload(e, 'cover')}
                      />
                      <Label htmlFor="cover-upload" className="absolute inset-0 cursor-pointer flex items-center justify-center bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" className="rounded-full pointer-events-none bg-white border-none shadow-xl text-primary font-bold">
                          Changer l'image
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-primary/5">
                  <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px] block mb-6">Portrait de profil</Label>
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-accent/10 overflow-hidden flex-shrink-0 border-4 border-white shadow-xl">
                      {memorial.profile_photo ? (
                        <img src={memorial.profile_photo} className="w-full h-full object-cover" alt="Profil" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-accent/40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-primary/60">Une photo de bureau ou de famille est recommandée pour le portrait principal.</p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="profile-upload"
                        onChange={(e) => handlePhotoUpload(e, 'profile')}
                      />
                      <Label htmlFor="profile-upload" className="cursor-pointer">
                        <Button variant="outline" className="rounded-full shadow-sm border-primary/10 h-11 px-6 font-bold text-xs uppercase tracking-widest pointer-events-none">
                          Télécharger
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="mt-0 space-y-12">
                <div className="space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-serif text-3xl text-primary mb-2">Souvenirs</h3>
                      <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">Partagez les moments de vie</p>
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="gallery-upload"
                        onChange={(e) => handlePhotoUpload(e, 'gallery')}
                      />
                      <Label htmlFor="gallery-upload" className="cursor-pointer">
                        <Button variant="secondary" className="rounded-full h-12 px-8 gap-3 shadow-lg shadow-accent/20 pointer-events-none font-bold uppercase tracking-widest text-xs">
                          <Plus className="w-5 h-5" />
                          Ajouter
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {(!memorial.photos || memorial.photos.length === 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-background rounded-3xl border border-dashed border-primary/10" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {memorial.photos.map((photo: string, index: number) => (
                        <div key={index} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-background shadow-sm border-4 border-white">
                          <img src={photo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Souvenir" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => removePhoto(index)}
                              className="p-3 bg-red-500 text-white rounded-2xl shadow-xl transform scale-75 group-hover:scale-100 transition-transform"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-8 pt-12 border-t border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                      <Video className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-serif text-3xl text-primary">Vidéos</h3>
                  </div>
                  <MediaUploader
                    onUpload={handleVideoUpload}
                    currentVideos={memorial.videos || []}
                    onRemove={removeVideo}
                    memorialId={memorialId}
                  />
                </div>
              </TabsContent>

              {/* Biography Tab */}
              <TabsContent value="bio" className="mt-0">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-serif text-3xl text-primary mb-2">Récit de vie</h3>
                    <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">L'histoire qui demeure</p>
                  </div>
                </div>
                <Textarea
                  value={memorial.biography || ''}
                  onChange={(e) => setMemorial(prev => prev ? { ...prev, biography: e.target.value } : null)}
                  placeholder="Il était une fois... Racontez les moments forts, les passions, et l'héritage laissé par votre proche."
                  className="min-h-[500px] border-primary/10 rounded-[2.5rem] p-8 md:p-12 leading-relaxed text-lg font-serif bg-background focus:bg-white transition-colors"
                />
              </TabsContent>

              {/* Tributes Tab */}
              <TabsContent value="tributes" className="mt-0 space-y-8">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="font-serif text-3xl text-primary mb-2">Témoignages</h3>
                    <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">{tributes.length} messages reçus</p>
                  </div>
                </div>

                {tributes.length === 0 ? (
                  <div className="text-center py-32 bg-background rounded-[3rem] border border-dashed border-primary/10">
                    <MessageSquare className="w-16 h-16 text-primary/5 mx-auto mb-6" />
                    <p className="text-primary/20 uppercase tracking-[0.2em] font-bold text-xs">Aucun message pour le moment</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {tributes.map((tribute) => (
                      <div key={tribute.id} className="bg-background rounded-[2rem] p-8 flex flex-col sm:flex-row items-start justify-between gap-6 border border-primary/5 hover:border-accent/20 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                              {(tribute.author_name && tribute.author_name.length > 0) ? tribute.author_name[0] : 'A'}
                            </div>
                            <div>
                              <span className="font-bold text-primary block">{tribute.author_name}</span>
                              <span className="text-[10px] text-primary/40 uppercase tracking-widest">{tribute.created_at}</span>
                            </div>
                            {!tribute.is_approved && (
                              <span className="px-3 py-1 bg-accent/10 text-accent text-[9px] uppercase font-bold rounded-full border border-accent/20 ml-2">
                                En attente
                              </span>
                            )}
                          </div>
                          <p className="text-primary/70 italic text-lg leading-relaxed">"{tribute.message}"</p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                          {!tribute.is_approved && (
                            <Button
                              onClick={() => approveTribute(tribute)}
                              size="icon"
                              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl h-12 w-12 shadow-lg shadow-green-200"
                            >
                              <Check className="w-6 h-6" />
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteTribute(tribute)}
                            size="icon"
                            variant="outline"
                            className="text-red-500 border-red-100 hover:bg-red-50 rounded-2xl h-12 w-12"
                          >
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="mt-0 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <StatsCard
                    label="Visites"
                    value={visits.length}
                    icon={EyeIcon}
                    color="text-accent"
                  />
                  <StatsCard
                    label="Hommages"
                    value={tributes.length}
                    icon={MessageSquare}
                    color="text-accent"
                  />
                  <StatsCard
                    label="Partages"
                    value={0}
                    icon={Share2}
                    color="text-accent"
                  />
                </div>

                <div className="bg-background rounded-[3rem] p-12 border border-primary/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h4 className="font-serif text-2xl text-primary">Activité récente</h4>
                      <p className="text-sm text-primary/40">Visites des 7 derniers jours</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-xs font-bold uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      Temps réel
                    </div>
                  </div>

                  <div className="h-[250px] flex items-end justify-between gap-2 px-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);

                      const dayVisits = visits.filter(v => {
                        const visitDate = v.visited_at || v.created_at;
                        return visitDate && visitDate.startsWith(dateStr);
                      }).length;

                      const maxVisits = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - j));
                        const ds = d.toISOString().split('T')[0];
                        return visits.filter(v => (v.visited_at || v.created_at || '').startsWith(ds)).length;
                      }), 1);

                      const height = (dayVisits / maxVisits) * 100;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="flex-1 w-full flex items-end justify-center relative">
                            {dayVisits > 0 && (
                              <div className="absolute -top-8 bg-primary text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                {dayVisits}
                              </div>
                            )}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 5)}%` }}
                              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                              className={`w-full max-w-[40px] rounded-t-xl transition-colors duration-300 ${dayVisits > 0 ? 'bg-accent' : 'bg-primary/5'}`}
                            />
                          </div>
                          <span className="text-[10px] text-primary/40 font-bold uppercase tracking-tighter">{dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0 space-y-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
                      <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-serif text-3xl text-primary">Signature visuelle</h3>
                  </div>
                  <ThemeSelector
                    currentTheme={memorial.theme || 'classic'}
                    onSelect={(theme: string) => setMemorial(prev => prev ? { ...prev, theme } : null)}
                    customColors={memorial.custom_colors}
                    onCustomColorsChange={(colors: any) => setMemorial(prev => prev ? { ...prev, custom_colors: colors } : null)}
                  />
                </div>

                <div className="space-y-8 pt-12 border-t border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                      <Settings className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-serif text-3xl text-primary">Confidentialité</h3>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-8 bg-background rounded-3xl border border-primary/5 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="space-y-1">
                        <p className="font-bold text-primary uppercase tracking-widest text-xs">Visibilité publique</p>
                        <p className="text-sm text-primary/40 leading-relaxed max-w-md">Le mémorial est visible par toute personne utilisant le lien ou le QR code.</p>
                      </div>
                      <Switch
                        checked={memorial.is_public ?? true}
                        onCheckedChange={(val) => setMemorial(prev => prev ? { ...prev, is_public: val } : null)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-8 bg-background rounded-3xl border border-primary/5 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="space-y-1">
                        <p className="font-bold text-primary uppercase tracking-widest text-xs">Espace participatif</p>
                        <p className="text-sm text-primary/40 leading-relaxed max-w-md">Autoriser le dépôt de messages et témoignages sur le mémorial.</p>
                      </div>
                      <Switch
                        checked={memorial.allow_comments ?? true}
                        onCheckedChange={(val) => setMemorial(prev => prev ? { ...prev, allow_comments: val } : null)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-8 bg-background rounded-3xl border border-primary/5 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="space-y-1">
                        <p className="font-bold text-primary uppercase tracking-widest text-xs">Modération stricte</p>
                        <p className="text-sm text-primary/40 leading-relaxed max-w-md">Chaque message doit être validé par vos soins avant publication.</p>
                      </div>
                      <Switch
                        checked={memorial.require_moderation ?? true}
                        onCheckedChange={(val) => setMemorial(prev => prev ? { ...prev, require_moderation: val } : null)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        memorial={memorial}
        url={memorial.slug ? `${window.location.origin}/memorial/${memorial.slug}` : `${window.location.origin}${createPageUrl('ViewMemorial', { id: memorialId || '' })}`}
        title={memorial?.name || ''}
      />
    </div>
  );
}
