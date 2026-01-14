import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Mail, Share2, QrCode as QrIcon, Check, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/api/apiClient';

interface ShareModalProps {
  memorial: any;
  onClose: () => void;
  isOpen: boolean;
  url?: string;
  title?: string;
}

export default function ShareModal({ memorial, onClose, isOpen, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Use props if provided, otherwise compute from memorial
  const memorialUrl = url || `${window.location.origin}/memorial/${memorial?.id}`;
  const memorialName = title || memorial?.name || 'Mémorial';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memorialUrl);
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareByEmail = async () => {
    if (!emailTo) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    setIsSending(true);

    try {
      await (api as any).functions.SendEmail?.({
        to: emailTo,
        subject: `${memorialName} - Mémorial Memorialis`,
        body: `
Bonjour,

Je souhaite partager avec vous le mémorial de ${memorialName}.

Vous pouvez le consulter en ligne à l'adresse suivante :
${memorialUrl}

Avec mes pensées,
L'équipe Memorialis
        `
      });

      toast.success('Email envoyé avec succès !');
      setEmailTo('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }

    setIsSending(false);
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

            <div className="space-y-8">
              {/* Copy Link */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-primary/40 uppercase tracking-widest block ml-1">Lien direct</label>
                <div className="flex gap-3">
                  <Input
                    value={memorialUrl}
                    readOnly
                    className="flex-1 border-primary/10 bg-background font-mono text-sm h-14 rounded-2xl px-6"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="btn-accent px-6 h-14 rounded-2xl shadow-lg shadow-accent/10"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <Copy className="w-6 h-6 text-primary" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share by Email */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-primary/40 uppercase tracking-widest block ml-1">Envoyer par email</label>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="destinataire@email.com"
                    className="flex-1 border-primary/10 h-14 rounded-2xl px-6"
                  />
                  <Button
                    onClick={shareByEmail}
                    disabled={isSending}
                    className="btn-primary px-6 h-14 rounded-2xl shadow-lg shadow-primary/10"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <Button
                  variant="outline"
                  className="w-full h-20 rounded-3xl border-primary/10 gap-4 hover:bg-primary/5 flex flex-col items-center justify-center p-0"
                >
                  <QrIcon className="w-6 h-6 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Télécharger QR</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-20 rounded-3xl border-primary/10 gap-4 hover:bg-primary/5 flex flex-col items-center justify-center p-0"
                >
                  <Download className="w-6 h-6 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Kit Mémorial</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
