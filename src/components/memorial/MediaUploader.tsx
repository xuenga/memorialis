import React, { useState } from 'react';
import { Plus, X, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/apiClient';
import { toast } from 'sonner';

interface MediaUploaderProps {
  onUpload: (videoData: any) => void;
  currentVideos: any[];
  onRemove: (index: number) => void;
  memorialId?: string;
}

export default function MediaUploader({ onUpload, currentVideos, onRemove, memorialId }: MediaUploaderProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadingToast = toast.loading('Téléchargement de la vidéo...');

      const uploadFolder = memorialId ? `memorials/${memorialId}` : 'memorials';
      const fileUrl = await api.storage.upload(file, uploadFolder);

      onUpload({
        url: fileUrl,
        title: file.name,
        type: 'file'
      });

      toast.dismiss(loadingToast);
      toast.success('Vidéo téléchargée !');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erreur: ${error.message || 'Problème de configuration'}`);
    }

    // Reset input
    e.target.value = '';
  };

  const handleAddVideo = () => {
    if (!videoUrl) return;

    onUpload({
      url: videoUrl,
      title: videoTitle || 'Lien vidéo',
      type: 'link'
    });

    setVideoUrl('');
    setVideoTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 p-8 bg-background rounded-3xl border border-primary/5">
        <div className="space-y-4">
          <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Télécharger une vidéo</Label>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="video-upload"
            onChange={handleFileUpload}
          />
          <Label
            htmlFor="video-upload"
            className="relative group aspect-video rounded-2xl overflow-hidden bg-white border-2 border-dashed border-primary/10 flex flex-col items-center justify-center hover:border-accent/50 transition-colors cursor-pointer"
          >
            <Video className="w-8 h-8 text-primary/20 mb-2 group-hover:text-accent transition-colors" />
            <p className="text-[10px] text-primary/40 uppercase tracking-widest font-bold">Choisir un fichier</p>
          </Label>
          <p className="text-[10px] text-primary/40">Fichiers mp4, mov, webm recommandés. Stocké sur Bunny Storage.</p>
        </div>

        <div className="space-y-4">
          <Label className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Ou ajouter un lien</Label>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Lien YouTube, Vimeo, etc."
                className="rounded-xl h-12"
              />
            </div>
            <div className="flex gap-2">
              <Input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Titre de la vidéo"
                className="rounded-xl h-12"
              />
              <Button onClick={handleAddVideo} className="btn-primary rounded-xl px-6 h-12">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentVideos.map((video, index) => (
          <div key={index} className="group relative bg-white rounded-2xl p-4 shadow-sm border border-primary/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Video className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary truncate">{video.title}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary/40 flex items-center gap-1 hover:text-accent"
              >
                Voir le lien <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-2 hover:bg-red-50 rounded-full text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
