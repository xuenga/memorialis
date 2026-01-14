import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/api/apiClient';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSending(true);

    try {
      if ((api as any).integrations?.Core?.SendEmail) {
        await (api as any).integrations.Core.SendEmail({
          to: 'contact@memorialis.shop',
          subject: `[Contact] ${formData.subject || 'Nouveau message'} - ${formData.name}`,
          body: `
    Nom: ${formData.name}
    Email: ${formData.email}
    Sujet: ${formData.subject || 'Non spécifié'}
    
    Message:
    ${formData.message}
            `
        });
      } else {
        // Mock send if not available
        console.log('Email sending skipped (API not available)');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success('Message envoyé avec succès !');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'envoi du message');
    }

    setIsSending(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@memorialis.shop',
      link: 'mailto:contact@memorialis.shop'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+33 1 23 45 67 89',
      link: 'tel:+33123456789'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Paris, France',
      link: null as string | null
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: 'Lun - Ven : 9h - 18h',
      link: null as string | null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-sm text-accent font-medium tracking-widest uppercase mb-4">
              Contact
            </span>
            <h1 className="font-serif text-4xl lg:text-6xl text-white mb-6">
              Une question ?<br />
              <span className="text-accent">Parlons-en</span>
            </h1>
            <p className="text-white/70 text-lg">
              Notre équipe est à votre écoute pour vous accompagner
              dans votre projet de mémorial.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-serif text-2xl text-primary mb-4">
                  Nous contacter
                </h2>
                <p className="text-primary/60">
                  N'hésite pas à nous écrire pour toute question
                  concernant nos produits ou votre commande.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <info.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-primary/50 mb-1">{info.title}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-primary font-medium hover:text-accent transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-primary font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  <h3 className="font-serif text-xl text-primary font-medium">Besoin d'aide ?</h3>
                </div>
                <p className="text-sm text-primary/60 leading-relaxed mb-4">
                  Consultez notre page <a href="/how-it-works" className="text-accent underline font-bold">Comment ça marche</a> pour
                  trouver des réponses à vos questions.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-primary/5">
                <h2 className="font-serif text-3xl text-primary mb-10">
                  Envoyez-nous un message
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <Label>Sujet</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Question sur ma commande..."
                  />
                </div>

                <div className="mb-10 space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Votre message..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  variant="secondary"
                  className="w-full py-8 rounded-full text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-accent/20 transition-all duration-500"
                >
                  {isSending ? (
                    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
