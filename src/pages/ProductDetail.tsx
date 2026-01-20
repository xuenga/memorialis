import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Minus, ShoppingBag, Check, QrCode, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id: productId } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      if (productId) {
        try {
          const products = await api.entities.Product.filter({ id: productId });
          if (products.length > 0) {
            setProduct(products[0]);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoading(false);
    };
    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    setIsAdding(true);

    const sessionId = localStorage.getItem('memorialis_session') || crypto.randomUUID();
    localStorage.setItem('memorialis_session', sessionId);

    const productData = product || {
      id: productId,
      name: 'Plaque Mémorielle',
      price: 89,
      material: 'plexiglass',
      image_url: 'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png'
    };

    try {
      await api.entities.CartItem.create({
        session_id: sessionId,
        product_id: productData.id,
        product_name: productData.name,
        product_image: productData.image_url,
        material: productData.material,
        price: productData.price,
        quantity: quantity,
        personalization: {},
        stripe_price_id: productData.stripe_price_id
      });

      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Produit ajouté au panier !');
    } catch (e) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayProduct = product || {
    id: productId,
    name: "Gravure Plexiglass Élégance",
    price: 89,
    material: 'plexiglass',
    image_url: 'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png',
    description: "Une plaque en plexiglass de haute qualité, gravée pour une durabilité éternelle. Résistante aux UV et aux intempéries, elle offre un rendu moderne et élégant.",
    dimensions: "10 x 10 cm"
  };

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl('Products')}
          className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux produits
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-sm">
              <img
                src={displayProduct.image_url || 'https://qrmemorial-nfvnhvdn.manus.space/images/hero-qr-memorial.png'}
                alt={displayProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                  <div className="w-full h-full bg-[#f5f5f0] flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-primary/10" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="text-sm text-accent font-bold uppercase tracking-widest">Support {displayProduct.material}</span>
              <h1 className="font-serif text-4xl lg:text-5xl text-primary mt-2 mb-4">{displayProduct.name}</h1>
              <p className="text-3xl text-primary font-medium">{displayProduct.price}€</p>
            </div>

            <div className="prose prose-stone mb-8">
              <p className="text-primary/70 text-lg leading-relaxed">
                {displayProduct.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-primary/60">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Dimensions : {displayProduct.dimensions}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Résistant aux intempéries et UV</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> QR Code gravé haute définition</li>
              </ul>
            </div>



            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-white rounded-full p-1 border border-primary/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-primary hover:bg-gray-50 rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-primary hover:bg-gray-50 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                variant="secondary"
                className="flex-1 h-16 rounded-full text-lg font-bold flex items-center gap-3 shadow-xl shadow-accent/20 transition-all duration-500"
              >
                {isAdding ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                Ajouter au panier
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex items-center gap-3 text-sm text-primary/60">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
                Livraison en 5-7 jours
              </div>
              <div className="flex items-center gap-3 text-sm text-primary/60">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                Garantie à vie
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
