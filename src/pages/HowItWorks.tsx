import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { QrCode, Upload, Users, Heart, ArrowRight, Check, ShoppingBag, Smartphone, Camera, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: ShoppingBag,
      title: "Choisissez votre plaque",
      description: "Sélectionnez le support qui correspond à vos souhaits : autocollant, plexiglass ou métal. Personnalisez avec le nom et les dates si souhaité."
    },
    {
      number: "02",
      icon: QrCode,
      title: "Recevez votre QR code unique",
      description: "Dès votre commande validée, un espace mémorial est créé avec un QR code unique. Vous recevez votre plaque sous 5-7 jours."
    },
    {
      number: "03",
      icon: Camera,
      title: "Personnalisez le mémorial",
      description: "Ajoutez des photos, vidéos et une biographie. Créez un espace riche en souvenirs pour honorer la mémoire de votre proche."
    },
    {
      number: "04",
      icon: Users,
      title: "Partagez avec vos proches",
      description: "Invitez famille et amis à découvrir le mémorial et à ajouter leurs propres témoignages et hommages."
    }
  ];

  const features = [
    {
      icon: Upload,
      title: "Photos & Vidéos illimités",
      description: "Téléchargez autant de médias que vous le souhaitez pour créer un album de souvenirs complet."
    },
    {
      icon: MessageSquare,
      title: "Hommages & Témoignages",
      description: "Permettez à vos proches de laisser des messages, avec modération si souhaité."
    },
    {
      icon: Smartphone,
      title: "Accessible partout",
      description: "Le mémorial est accessible 24/7 depuis n'importe quel smartphone, tablette ou ordinateur."
    },
    {
      icon: Heart,
      title: "Préservé à vie",
      description: "Votre espace mémorial est maintenu indéfiniment, pour les générations futures."
    }
  ];

  const faqs = [
    {
      question: "Combien de temps dure l'accès au mémorial ?",
      answer: "L'accès est à vie. Votre espace mémorial sera préservé indéfiniment et restera accessible via l'adresse memorialis.shop."
    },
    {
      question: "Qui peut voir le mémorial ?",
      answer: "Vous contrôlez la visibilité. Le mémorial peut être public (accessible via le QR code) ou privé (protégé par un code d'accès)."
    },
    {
      question: "Puis-je modifier le mémorial après sa création ?",
      answer: "Oui, vous pouvez ajouter, modifier ou supprimer du contenu à tout moment depuis votre espace personnel."
    },
    {
      question: "Comment fonctionne la modération des commentaires ?",
      answer: "Vous pouvez activer la modération : chaque commentaire devra être approuvé avant d'être visible sur le mémorial."
    },
    {
      question: "Puis-je commander plusieurs plaques pour le même mémorial ?",
      answer: "Oui, vous pouvez commander des plaques supplémentaires qui pointeront vers le même espace mémorial."
    }
  ];

  return (
    <div className="min-h-screen bg-[#e6e6da]">
      {/* Hero */}
      <section className="bg-[#2f4858] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-sm text-[#e0bd3e] font-medium tracking-widest uppercase mb-4">
              Comment ça marche
            </span>
            <h1 className="font-serif text-4xl lg:text-6xl text-white mb-6">
              Simple, élégant,<br />
              <span className="text-[#e0bd3e]">éternel</span>
            </h1>
            <p className="text-white/70 text-lg">
              En quelques étapes simples, créez un hommage numérique
              qui préservera la mémoire de votre proche pour toujours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#e0bd3e]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#2f4858]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <span className="inline-block text-sm text-[#e0bd3e] font-medium tracking-widest uppercase mb-4">
              Le Processus
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl text-[#2f4858] mb-4">
              4 étapes simples
            </h2>
            <p className="text-[#2f4858]/60 text-lg">
              De la commande au partage, créez un mémorial en toute simplicité
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Connecting line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-12 h-0.5 bg-gradient-to-r from-[#e0bd3e]/30 to-transparent -translate-y-1/2 z-0" />
                )}

                {/* Card */}
                <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-lg shadow-[#2f4858]/5 border border-[#2f4858]/5 hover:border-[#e0bd3e]/30 transition-all duration-500 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e0bd3e]/0 via-[#e0bd3e]/0 to-[#e0bd3e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Number badge */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-[#e0bd3e]/20 rounded-2xl blur-xl group-hover:bg-[#e0bd3e]/30 transition-colors" />
                        <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-[#2f4858] to-[#2f4858]/80 flex items-center justify-center shadow-xl shadow-[#2f4858]/20">
                          <span className="font-serif text-2xl lg:text-3xl font-bold text-[#e0bd3e]">
                            {step.number}
                          </span>
                        </div>
                      </motion.div>

                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-[#e6e6da] flex items-center justify-center group-hover:bg-[#e0bd3e]/10 transition-colors duration-300"
                      >
                        <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-[#2f4858] group-hover:text-[#e0bd3e] transition-colors duration-300" />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl lg:text-3xl text-[#2f4858] mb-4 group-hover:text-[#2f4858] transition-colors">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#2f4858]/70 leading-relaxed text-base lg:text-lg">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    <div className="mt-6 flex items-center gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all duration-500 ${i === index
                            ? 'w-12 bg-[#e0bd3e]'
                            : i < index
                              ? 'w-8 bg-[#e0bd3e]/50'
                              : 'w-6 bg-[#2f4858]/10'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#e0bd3e]/5 rounded-full blur-2xl group-hover:bg-[#e0bd3e]/10 transition-colors duration-500" />
                </div>

                {/* Arrow indicator for mobile */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="lg:hidden flex justify-center my-6"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#e0bd3e]/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[#e0bd3e] rotate-90" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-[#2f4858]/50 text-sm mb-4">
              Prêt à commencer ?
            </p>
            <Link to={createPageUrl('Products')}>
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 border-[#2f4858]/20 text-[#2f4858] hover:bg-[#2f4858] hover:text-white hover:border-[#2f4858] transition-all duration-300 group"
              >
                Voir nos plaques
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm text-[#e0bd3e] font-medium tracking-widest uppercase mb-4">
              Fonctionnalités
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl text-[#2f4858]">
              Tout ce dont vous avez besoin
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 rounded-2xl border border-[#2f4858]/10 hover:border-[#e0bd3e]/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-[#e6e6da] flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-[#2f4858]" />
                </div>
                <h3 className="font-serif text-xl text-[#2f4858] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#2f4858]/60 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm text-[#e0bd3e] font-medium tracking-widest uppercase mb-4">
              FAQ
            </span>
            <h2 className="font-serif text-3xl lg:text-5xl text-[#2f4858]">
              Questions fréquentes
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 lg:p-8"
              >
                <h3 className="font-medium text-[#2f4858] text-lg mb-3">
                  {faq.question}
                </h3>
                <p className="text-[#2f4858]/60">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 bg-[#2f4858]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl lg:text-5xl text-white mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Créez un hommage éternel en quelques minutes.
              Votre plaque sera livrée chez vous sous 5-7 jours.
            </p>
            <Link to={createPageUrl('Products')}>
              <Button variant="secondary" size="lg" className="px-12 py-8 rounded-full flex items-center gap-3 mx-auto shadow-2xl shadow-accent/20 transition-all duration-500 font-bold text-lg">
                Découvrir nos plaques
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
