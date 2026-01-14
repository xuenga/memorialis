import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Cart() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = async () => {
    setIsLoading(true);
    const sessionId = localStorage.getItem('memorialis_session');
    if (sessionId) {
      try {
        const cartItems = await api.entities.CartItem.filter({ session_id: sessionId });
        setItems(cartItems);
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (item: any, delta: number) => {
    const newQuantity = (item.quantity || 1) + delta;
    if (newQuantity < 1) {
      await removeItem(item);
    } else {
      try {
        await api.entities.CartItem.update(item.id, { quantity: newQuantity });
        loadCart();
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (e) {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  const removeItem = async (item: any) => {
    try {
      await api.entities.CartItem.delete(item.id);
      toast.success('Produit retiré du panier');
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const clearCart = async () => {
    if (!confirm('Voulez-vous vraiment vider votre panier ?')) return;
    const sessionId = localStorage.getItem('memorialis_session');
    if (!sessionId) return;
    try {
      const cartItems = await api.entities.CartItem.filter({ session_id: sessionId });
      for (const item of cartItems) {
        await api.entities.CartItem.delete(item.id);
      }
      toast.success('Panier vidé');
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      toast.error('Erreur lors du nettoyage du panier');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 100 || items.length === 0 ? 0 : 5.90;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ShoppingBag className="w-10 h-10 text-primary/30" />
          </div>
          <h1 className="font-serif text-3xl text-primary mb-4">
            Votre panier est vide
          </h1>
          <p className="text-primary/60 mb-8">
            Découvrez nos plaques mémorielles et créez un hommage éternel pour vos proches.
          </p>
          <Link to={createPageUrl('Products')}>
            <Button variant="secondary" size="lg" className="rounded-full px-10 py-7 font-bold shadow-xl shadow-accent/20 transition-all duration-500">
              Découvrir nos plaques
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl text-primary mb-2">
                Votre Panier
              </h1>
              <p className="text-primary/60 font-serif text-lg">
                {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-red-400 border-red-100 hover:bg-red-50 hover:text-red-500 rounded-full px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vider mon panier
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm group"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-background">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-xl text-primary mb-1">
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-primary/50 capitalize">
                            Support {item.material}
                          </p>
                          {item.personalization?.deceased_name && (
                            <p className="text-sm text-accent mt-2 font-medium">
                              Pour : {item.personalization.deceased_name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-primary/10 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 rounded-full transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-primary">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 rounded-full transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                        <p className="font-serif text-2xl text-primary">
                          {(item.price * (item.quantity || 1)).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm sticky top-32"
            >
              <h3 className="font-serif text-2xl text-primary mb-8">
                Récapitulatif
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-primary/70">
                  <span>Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-primary/70">
                  <span>Livraison</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)}€`}</span>
                </div>
                {shipping > 0 && (
                  <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                    <p className="text-xs text-accent font-medium leading-relaxed">
                      Plus que <span className="font-bold">{(100 - subtotal).toFixed(2)}€</span> pour la livraison offerte !
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-primary/5 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl text-primary">Total</span>
                  <span className="font-serif text-3xl text-primary">
                    {total.toFixed(2)}€
                  </span>
                </div>
              </div>

              <Link to={createPageUrl('Checkout')}>
                <Button variant="secondary" className="w-full py-8 rounded-full text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 transition-all duration-500">
                  Passer commande
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link
                to={createPageUrl('Products')}
                className="block text-center text-sm text-primary/40 hover:text-accent mt-6 transition-colors uppercase tracking-widest font-bold"
              >
                Continuer mes achats
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
