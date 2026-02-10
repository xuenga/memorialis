import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import PlaqueConfigurator from '@/components/plaque/PlaqueConfigurator';

interface CartItemData {
    id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    price: number;
    quantity: number;
    requires_configuration?: string;
    personalization?: {
        plaque_photo_url?: string;
        engraving_message?: string;
        [key: string]: any;
    };
}

export default function ConfigurePlaque() {
    const { cartItemId } = useParams<{ cartItemId: string }>();
    const navigate = useNavigate();
    const [cartItem, setCartItem] = useState<CartItemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadCartItem = async () => {
            if (!cartItemId) {
                navigate(createPageUrl('Cart'));
                return;
            }

            try {
                const item = await api.entities.CartItem.get(cartItemId);
                if (!item) {
                    toast.error('Article non trouvé dans le panier');
                    navigate(createPageUrl('Cart'));
                    return;
                }
                setCartItem(item);
            } catch (error) {
                console.error('Error loading cart item:', error);
                toast.error('Erreur lors du chargement');
                navigate(createPageUrl('Cart'));
            } finally {
                setIsLoading(false);
            }
        };

        loadCartItem();
    }, [cartItemId, navigate]);

    const handleSave = async (photoUrl: string | null, message: string) => {
        if (!cartItem || !cartItemId) return;

        setIsSaving(true);
        try {
            // Merge with existing personalization data
            const updatedPersonalization = {
                ...(cartItem.personalization || {}),
                plaque_photo_url: photoUrl || undefined,
                engraving_message: message || undefined,
                configured: true,
                configured_at: new Date().toISOString()
            };

            await api.entities.CartItem.update(cartItemId, {
                personalization: updatedPersonalization
            });

            toast.success('Configuration enregistrée !');
            window.dispatchEvent(new Event('cartUpdated'));
            navigate(createPageUrl('Cart'));
        } catch (error: any) {
            console.error('Error saving configuration:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(createPageUrl('Cart'));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!cartItem) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                    <h1 className="font-serif text-2xl text-primary mb-4">Article non trouvé</h1>
                    <Link to={createPageUrl('Cart')}>
                        <button className="text-accent hover:underline">Retour au panier</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 lg:py-12">
            <div className="max-w-3xl mx-auto px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        to={createPageUrl('Cart')}
                        className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-medium mb-6"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Retour au panier
                    </Link>

                    <h1 className="font-serif text-3xl lg:text-4xl text-primary mb-2">
                        Personnalisez votre plaque
                    </h1>
                    <p className="text-primary/60">
                        {cartItem.requires_configuration === 'message_and_photo'
                            ? 'Ajoutez une photo et un message personnel qui seront gravés sur votre plaque mémoriale.'
                            : 'Ajoutez un message personnel qui sera gravé sur votre plaque mémoriale.'
                        }
                    </p>
                </motion.div>

                {/* Configurator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PlaqueConfigurator
                        initialPhotoUrl={cartItem.personalization?.plaque_photo_url}
                        initialMessage={cartItem.personalization?.engraving_message}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        productName={cartItem.product_name}
                        productImage={cartItem.product_image}
                        configurationType={(cartItem.requires_configuration as 'message_only' | 'message_and_photo') || 'message_and_photo'}
                    />
                </motion.div>

                {/* Saving overlay */}
                {isSaving && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl flex items-center gap-4">
                            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            <span className="text-primary font-medium">Enregistrement...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
