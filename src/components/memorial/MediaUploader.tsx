import React, { useState } from 'react';
import { Plus, X, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaUploaderProps {
  onUpload: (videoData: any) => void;
  currentVideos: any[];
  onRemove: (index: number) => void;
}

export default function MediaUploader({ onUpload, currentVideos, onRemove }: MediaUploaderProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleAddVideo = () => {
    if (!videoUrl) return;

    // Simple mock video data
    onUpload({
      url: videoUrl,
      title: videoTitle || 'Sans titre',
      type: 'youtube' // for example
    });

    setVideoUrl('');
    setVideoTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4 p-6 bg-background rounded-2xl border border-primary/5">
        <div className="space-y-2">
          <Label>Lien vidéo (YouTube, Vimeo, etc.)</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="space-y-2">
          <Label>Titre de la vidéo</Label>
          <div className="flex gap-2">
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Ex: Hommage famille"
            />
            <Button onClick={handleAddVideo} className="btn-primary rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
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
