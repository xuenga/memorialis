import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, Heart, Shield, Users, Star, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.entities.Product.filter({ is_active: true });
        setProducts(data.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
    };
    loadProducts();
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "QR Code Unique",
      description: "Chaque mémorial possède son propre QR code, accessible à vie depuis n'importe quel smartphone."
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      description: "Vos souvenirs sont protégés. Vous contrôlez qui peut voir et commenter le mémorial."
    },
    {
      icon: Heart,
      title: "Hommages Illimités",
      description: "Photos, vidéos, témoignages... Partagez tous les souvenirs qui comptent."
    },
    {
      icon: Users,
      title: "Partage Familial",
      description: "Invitez vos proches à contribuer et enrichir le mémorial ensemble."
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      text: "Un moyen magnifique de garder vivante la mémoire de ma mère. Toute la famille peut y accéder et ajouter des souvenirs.",
      rating: 5
    },
    {
      name: "Pierre D.",
      text: "La qualité de la plaque est exceptionnelle. Un geste d'amour éternel pour mon père.",
      rating: 5
    },
    {
      name: "Sophie M.",
      text: "Simple, élégant, et tellement émouvant. Merci Memorialis pour cette belle initiative.",
      rating: 5
    }
  ];

  const previewProducts = products.length > 0 ? products : [
    {
      id: "demo-1",
      slug: "demo-1",
      name: "QRcode sur Plaque Autocollante Premium",
      price: 49,
      description: "Facile à installer sur toute surface lisse",
      image_url: "/images/hero-memorialis.jpg",
      material: "autocollant",
      is_featured: false
    },
    {
      id: "demo-2",
      slug: "demo-2",
      name: "QRcode sur Plaque Autocollante Classique",
      price: 39,
      description: "Solution économique et élégante",
      image_url: "/images/hero-memorialis.jpg",
      material: "autocollant",
      is_featured: false
    },
    {
      id: "demo-3",
      slug: "demo-3",
      name: "QRcode sur Gravure Plexiglass Élégance",
      price: 89,
      description: "Élégance et transparence pour un rendu moderne",
      image_url: "/images/hero-memorialis.jpg",
      material: "plexiglass",
      is_featured: true
    }
  ];

  return (
    <div className="overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/70 to-primary/85 z-10" />
          <img
            src="/images/hero-memorialis.jpg"
            alt="Memorial"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32 z-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-6">
                Un scan,<br />
                <span className="text-accent">une vie,</span><br />
                mille souvenirs
              </h1>

              <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
                Créez un espace numérique éternel pour honorer la mémoire d'un être cher.
                Accessible par QR code, partageable avec vos proches.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Link to={createPageUrl('Products')}>
                  <Button variant="secondary" size="lg" className="px-10 py-7 text-lg rounded-full flex items-center gap-3 w-full sm:w-auto">
                    Découvrir nos plaques
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={createPageUrl('HowItWorks')}>
                  <Button variant="outline" size="lg" className="px-10 py-7 text-lg rounded-full border-white/20 text-white hover:bg-white hover:text-primary w-full sm:w-auto transition-all">
                    Comment ça marche
                  </Button>
                </Link>
              </div>

              {/* Mobile Demo Link */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:hidden"
              >
                <Link to="/memorial/demo-memorial" className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-accent/40 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 relative overflow-hidden flex-shrink-0">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=https%3A%2F%2Fmemorialis.shop%2Fqr%2F2601-0001"
                      alt="Demo QR"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-primary/60 mix-blend-overlay" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Exemple interactif</p>
                    <p className="font-serif text-white group-hover:text-accent transition-colors">Découvrir un mémorial démo</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Desktop Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <Link to="/memorial/demo-memorial" className="relative block group cursor-pointer max-w-[320px] w-full">
                <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 group-hover:border-accent/40 transition-colors duration-500">
                  <div className="relative aspect-square rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-xl">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=https%3A%2F%2Fmemorialis.shop%2Fqr%2F2601-0001"
                      alt="QR Code démo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-transparent to-primary/30" />
                  </div>
                  <div className="mt-6 text-center">
                    <span className="inline-block px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm md:text-base font-bold tracking-wide group-hover:bg-accent/30 transition-all duration-300">
                      Cliquez pour découvrir un exemple de mémorial
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-accent"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          >
            <span className="inline-block text-sm text-accent font-medium tracking-widest uppercase mb-4">
              Pourquoi nous choisir
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-primary mb-6">
              Une solution pensée avec le cœur
            </h2>
            <p className="text-primary/60 text-lg">
              Nous avons créé Memorialis pour offrir un moyen moderne et respectueux
              de préserver la mémoire de ceux qui nous sont chers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary group-hover:bg-accent flex items-center justify-center mb-6 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-accent group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-xl text-primary mb-3">{feature.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 lg:py-32 bg-white rounded-[4rem] mx-4 my-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16"
          >
            <div>
              <span className="inline-block text-sm text-accent font-medium tracking-widest uppercase mb-4">
                Nos créations
              </span>
              <h2 className="font-serif text-4xl lg:text-5xl text-primary">
                Choisissez votre support
              </h2>
            </div>
            <Link
              to={createPageUrl('Products')}
              className="mt-6 lg:mt-0 flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
            >
              Voir tous les produits
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previewProducts.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={createPageUrl('ProductDetail', { slug: product.slug || product.id })}>
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-primary shadow-sm mb-6">
                    {product.is_featured && (
                      <div className="absolute top-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm uppercase tracking-wider">
                        <Star className="w-4 h-4 fill-current" />
                        Populaire
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/25 z-10" />
                    <img
                      src={product.image_url || product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                    <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
                      <Button variant="secondary" className="w-full py-7 rounded-full text-lg font-bold shadow-2xl">
                        Découvrir le produit
                      </Button>
                    </div>
                  </div>
                </Link>

                <div className="px-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#e0bd3e]">
                        Support {product.material || "Premium"}
                      </span>
                      <h3 className="font-serif text-3xl text-primary mt-1 group-hover:text-primary/70 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <p className="font-serif text-2xl text-primary">{product.price}€</p>
                  </div>
                  <p className="text-primary/60 text-sm leading-relaxed mb-6">
                    {product.description || product.desc}
                  </p>
                  <div className="flex items-center gap-6 pt-4 border-t border-primary/5">
                    <div className="flex items-center gap-2 text-primary/40 text-[10px] uppercase font-bold tracking-wider">
                      <QrCode className="w-4 h-4" />
                      Accès à vie
                    </div>
                    <div className="flex items-center gap-2 text-primary/40 text-[10px] uppercase font-bold tracking-wider">
                      <ShoppingBag className="w-4 h-4" />
                      Livraison offerte
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block text-sm text-accent font-medium tracking-widest uppercase mb-4">
              Témoignages
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-white">
              Ce que disent nos clients
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed mb-8 italic text-lg">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                    {testimonial.name[0]}
                  </div>
                  <p className="font-medium text-accent">{testimonial.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-52 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl lg:text-6xl text-primary mb-8">
              Prêt à créer un hommage éternel ?
            </h2>
            <p className="text-primary/60 text-xl mb-12 max-w-2xl mx-auto">
              Commandez votre plaque mémorielle aujourd'hui et recevez
              un accès immédiat à votre espace numérique personnalisé.
            </p>
            <Link to={createPageUrl('Products')}>
              <Button size="lg" className="px-12 py-9 text-xl font-bold rounded-full shadow-2xl shadow-primary/30 hover:shadow-accent/40 transform hover:-translate-y-1 transition-all duration-500">
                Commander maintenant
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
