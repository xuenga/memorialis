import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, CreditCard, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Checkout() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    country: 'France'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      const sessionId = localStorage.getItem('memorialis_session');
      if (sessionId) {
        try {
          const cartItems = await api.entities.CartItem.filter({ session_id: sessionId });
          setItems(cartItems);
          if (cartItems.length === 0) {
            navigate(createPageUrl('Cart'));
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        navigate(createPageUrl('Cart'));
      }
      setIsLoading(false);
    };
    loadCart();
  }, [navigate]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= 100 || items.length === 0 ? 0 : 9.90;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.street || !formData.city || !formData.postal_code) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessing(true);

    try {
      // Créer une session Stripe Checkout
      const result = await (api.functions as any).createStripeCheckout({
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity || 1,
          price: item.price,
          personalization: item.personalization,
          stripe_price_id: item.stripe_price_id
        })),
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_address: {
          street: formData.street,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country
        },
        success_url: `${window.location.origin}${createPageUrl('OrderConfirmation')}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}${createPageUrl('Checkout')}`
      });

      // Sauvegarder les données de livraison dans le localStorage
      localStorage.setItem('checkout_shipping', JSON.stringify({
        street: formData.street,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone
      }));

      // Rediriger vers Stripe
      if (result && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No URL returned from checkout function');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <Link
          to={createPageUrl('Cart')}
          className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au panier
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-primary mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center text-lg font-bold">
                    1
                  </div>
                  Informations de contact
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Nom complet *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-primary mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center text-lg font-bold">
                    2
                  </div>
                  Adresse de livraison
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Adresse *</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="123 Rue de la Paix"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Paris"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code postal *</Label>
                    <Input
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="75001"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-8 p-6 bg-background rounded-3xl border border-primary/5">
                  <Truck className="w-6 h-6 text-accent" />
                  <p className="text-sm text-primary/70">
                    Livraison estimée sous 5-7 jours ouvrés
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-primary mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  Paiement
                </h2>

                <div className="flex items-center gap-4 p-6 bg-background rounded-3xl border border-primary/5">
                  <Lock className="w-6 h-6 text-accent" />
                  <p className="text-sm text-primary/70">
                    Le paiement sera traité de manière sécurisée par Stripe. Aucune donnée bancaire n'est conservée sur nos serveurs.
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-8 px-4">
                  <CreditCard className="w-8 h-8 text-primary/20" />
                  <div className="flex gap-3">
                    <div className="w-12 h-8 bg-background border border-primary/5 rounded-lg flex items-center justify-center text-[8px] font-bold text-primary/20">VISA</div>
                    <div className="w-12 h-8 bg-background border border-primary/5 rounded-lg flex items-center justify-center text-[8px] font-bold text-primary/20">MC</div>
                    <div className="w-12 h-8 bg-background border border-primary/5 rounded-lg flex items-center justify-center text-[8px] font-bold text-primary/20">AMEX</div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-white w-full py-8 rounded-full text-xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    Confirmer et payer - {total.toFixed(2)}€
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm sticky top-32">
              <h3 className="font-serif text-2xl text-primary mb-8">
                Votre commande
              </h3>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-background flex-shrink-0 overflow-hidden">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-serif text-primary truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">
                        Qté: {item.quantity || 1}
                      </p>
                      <p className="text-base font-medium text-primary mt-1">
                        {(item.price * (item.quantity || 1)).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary/5 pt-6 space-y-4">
                <div className="flex justify-between text-base text-primary/60">
                  <span>Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-base text-primary/60">
                  <span>Livraison</span>
                  <span className="font-medium text-green-600">{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)}€`}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-primary/10">
                  <span className="font-serif text-xl text-primary">Total</span>
                  <span className="font-serif text-3xl text-accent">{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* What's included */}
              <div className="mt-10 pt-8 border-t border-primary/5">
                <p className="text-xs font-bold text-primary/30 uppercase tracking-[0.2em] mb-6">Inclus avec votre commande</p>
                <div className="space-y-4">
                  {[
                    'Plaque avec QR code unique',
                    'Espace mémorial numérique illimité',
                    'Accès à vie pour vos proches',
                    'Support client dédié 7j/7'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-primary/70">
                      <div className="mt-1">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
