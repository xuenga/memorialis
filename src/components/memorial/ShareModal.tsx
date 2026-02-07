import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, QrCode as QrIcon, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ShareModalProps {
  memorial: any;
  onClose: () => void;
  isOpen: boolean;
  url?: string;
  title?: string;
}

export default function ShareModal({ memorial, onClose, isOpen, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Build the public URL with memorialis.shop domain
  const slug = memorial?.slug;
  const memorialId = memorial?.id;
  const memorialPath = slug ? `/memorial/${slug}` : `/memorial/${memorialId}`;
  const memorialUrl = url?.replace(window.location.origin, 'https://memorialis.shop')
    || `https://memorialis.shop${memorialPath}`;
  const displayUrl = memorialUrl.replace('https://', '');
  const memorialName = title || memorial?.name || 'Mémorial';

  // QR Code URL
  const qrCodeUrl = memorial?.access_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://memorialis.shop/qr/${memorial.access_code}`)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(memorialUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `Mémorial de ${memorialName}`,
      text: `Découvrez le mémorial de ${memorialName}`,
      url: memorialUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Partage réussi !');
      } catch (error: any) {
        // User cancelled or error
        if (error.name !== 'AbortError') {
          toast.error('Erreur lors du partage');
        }
      }
    } else {
      // Fallback: open email client
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Mémorial de ${memorialName}`)}&body=${encodeURIComponent(`Découvrez le mémorial de ${memorialName} : ${memorialUrl}`)}`;
      window.open(mailtoUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 w-full max-w-xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -z-10 -mr-32 -mt-32" />

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Share2 className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl text-primary">Partager</h3>
                  <p className="text-primary/40 text-sm uppercase tracking-widest font-bold">L'hommage de {memorialName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-primary/5 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-primary/20 group-hover:text-primary" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Copy Link */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-primary/40 uppercase tracking-widest block ml-1">Lien direct</label>
                <div className="flex gap-3">
                  <Input
                    value={displayUrl}
                    readOnly
                    className="flex-1 border-primary/10 bg-background font-mono text-sm h-14 rounded-2xl px-6"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-primary hover:bg-primary/90 px-6 h-14 rounded-2xl shadow-lg"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Copy className="w-6 h-6 text-white" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Native Share Button */}
              <Button
                onClick={handleNativeShare}
                className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-primary font-bold text-base gap-3 shadow-lg shadow-accent/20"
              >
                <ExternalLink className="w-5 h-5" />
                Partager via SMS, Email, WhatsApp...
              </Button>

              {/* Show QR Button */}
              <Button
                onClick={() => setShowQR(true)}
                variant="outline"
                className="w-full h-16 rounded-2xl border-primary/10 gap-3 hover:bg-primary/5 font-bold"
              >
                <QrIcon className="w-5 h-5 text-accent" />
                Afficher le QR Code
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Code Fullscreen Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-primary flex flex-col items-center justify-center p-8"
          onClick={() => setShowQR(false)}
        >
          <button
            onClick={() => setShowQR(false)}
            className="absolute top-6 right-6 p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-2xl"
          >
            <img
              src={qrCodeUrl}
              alt="QR Code du mémorial"
              className="w-64 h-64 sm:w-80 sm:h-80"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60 text-sm uppercase tracking-widest font-bold mb-2">Scannez ce code</p>
            <p className="text-white font-serif text-2xl">{memorialName}</p>
            {memorial?.access_code && (
              <p className="text-white/40 font-mono text-sm mt-2">{memorial.access_code}</p>
            )}
          </motion.div>

          <p className="absolute bottom-8 text-white/30 text-xs">Appuyez n'importe où pour fermer</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
