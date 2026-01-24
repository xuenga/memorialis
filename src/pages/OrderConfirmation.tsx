import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Check, Copy, QrCode, ArrowRight, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OrderConfirmation() {
  const [order, setOrder] = useState<any>(null);
  const [memorial, setMemorial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const orderId = urlParams.get('order');
  const memorialId = urlParams.get('memorial');
  const accessCodeFromUrl = urlParams.get('code');

  useEffect(() => {
    const loadData = async () => {
      // 1. Try to load directly if IDs are present
      if (orderId) {
        try {
          const orders = await api.entities.Order.filter({ id: orderId });
          if (orders.length > 0) setOrder(orders[0]);
        } catch (e) { console.error(e) }
      }
      if (memorialId) {
        try {
          const memorials = await api.entities.Memorial.filter({ id: memorialId });
          if (memorials.length > 0) setMemorial(memorials[0]);
        } catch (e) { console.error(e) }
      }

      // 2. Check/Repair with session_id if we have it
      // Always verify with session_id if we don't have a confirmed memorial yet
      // This allows the auto-repair logic in the backend to run if the order exists but has no memorial
      if (sessionId && (!memorialId || !orderId)) {
        try {
          console.log('Verifying order with session:', sessionId);
          const data = await (api.functions as any).confirmOrder(sessionId);
          console.log('Verification result:', data);

          if (data.order) setOrder(data.order);
          if (data.memorial) {
            setMemorial(data.memorial);
          } else if (data.order && !data.memorial) {
            // EMERGENCY SERVER REPAIR CALL
            console.log('Backend returned no memorial. Attempting SERVER-SIDE repair...');
            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
              const repairRes = await fetch(`${supabaseUrl}/functions/v1/repair-order`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${anonKey}`
                },
                body: JSON.stringify({ order_id: data.order.id })
              });
              const repairData = await repairRes.json();
              if (repairRes.ok && repairData.memorial) {
                setMemorial(repairData.memorial);
                setOrder({ ...data.order, memorial_id: repairData.memorial.id });
                toast.success("Mémorial réparé avec succès !");
              }
            } catch (repairError) {
              console.error('Server-side repair failed:', repairError);
            }
          }

          // CLEAR CART after successful verification
          const cartSessionId = localStorage.getItem('memorialis_session');
          if (cartSessionId && data.order) {
            try {
              console.log('Clearing cart for session:', cartSessionId);
              await api.entities.CartItem.delete({ session_id: cartSessionId });
              window.dispatchEvent(new Event('cartUpdated'));
            } catch (cartError) {
              console.error('Failed to clear cart:', cartError);
            }
          }

        } catch (error) {
          console.error('Verification failed:', error);
          // Don't show error toast if we managed to load something from IDs above
          if (!orderId && !memorialId) {
            toast.error("Erreur lors de la vérification. Veuillez contacter le support.");
          }
        }
      }

      setIsLoading(false);
    };
    loadData();
  }, [orderId, memorialId, sessionId]);

  const accessCode = accessCodeFromUrl || memorial?.access_code || 'MEM-SAMPLE';

  const copyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e6e6da] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e0bd3e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6e6da] py-12 lg:py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-[#e0bd3e] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-[#2f4858]" />
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl text-[#2f4858] mb-4">
            Merci pour votre commande !
          </h1>
          <p className="text-[#2f4858]/60 text-lg">
            Votre commande #{order?.order_number || '12345'} a bien été enregistrée.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm mb-8"
        >
          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#2f4858]/5">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-primary mb-2">Votre mémorial est prêt</h2>
              <p className="text-[#2f4858]/60">Vous pouvez dès maintenant commencer à le personnaliser.</p>
            </div>
          </div>

          <div className="grid gap-8">
            <div>
              <span className="block text-sm font-medium text-primary/40 uppercase tracking-widest mb-4">
                Code d'accès unique
              </span>
              <div className="flex items-center gap-3 p-1 bg-[#e6e6da]/30 rounded-2xl border border-primary/5">
                <div className="flex-1 px-5 py-3 font-mono text-xl tracking-wider text-primary">
                  {accessCode}
                </div>
                <Button
                  onClick={copyAccessCode}
                  variant="ghost"
                  className="rounded-xl h-12 gap-2 text-primary"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié' : 'Copier'}
                </Button>
              </div>
              <p className="mt-4 text-sm text-[#2f4858]/40 flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Ce code ainsi que les instructions vous ont été envoyés par email.
                Veuillez le conserver précieusement, il vous servira à modifier le mémorial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={createPageUrl('EditMemorial', { id: memorial?.id || memorialId || 'm1' })} className="flex-1">
                <Button className="btn-accent w-full h-14 rounded-full text-lg font-medium flex items-center gap-3">
                  Personnaliser maintenant
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('MyMemorials')} className="flex-1">
                <Button variant="outline" className="w-full h-14 rounded-full text-lg font-medium border-primary/20 text-primary">
                  Mes mémoriaux
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-8 bg-primary/5 rounded-3xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-[#e0bd3e]">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-serif text-lg">Memorialis</span>
          </div>
          <p className="text-[#2f4858]/60 text-sm leading-relaxed max-w-sm mx-auto">
            Nous préparons votre plaque avec le plus grand soin.
            Vous recevrez un notification dès qu'elle sera expédiée.
          </p>
        </motion.div>

        {/* DEBUG BLOCK - TO REMOVE */}
        <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded text-xs font-mono text-red-800 break-all">
          <p><strong>DEBUG INFO:</strong></p>
          <p>Session ID: {sessionId || 'null'}</p>
          <p>Order ID (URL): {orderId || 'null'}</p>
          <p>Memorial ID (URL): {memorialId || 'null'}</p>
          <p>Order State: {order ? 'Loaded' : 'Null'}</p>
          <p>Memorial State: {memorial ? 'Loaded' : 'Null'}</p>
          <p>Access Code: {accessCode}</p>
        </div>
      </div>
    </div>
  );
}
