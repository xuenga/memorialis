import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { QrCode, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeData {
    id: string;
    code: string;
    status: 'available' | 'reserved' | 'activated';
    memorial_id?: string;
    owner_email?: string;
}

export default function QRRedirect() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [qrCode, setQRCode] = useState<QRCodeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        const loadQRCode = async () => {
            if (!code) {
                setError('Code QR invalide');
                setIsLoading(false);
                return;
            }

            try {
                const results = await api.entities.QRCode.filter({ code: code.toUpperCase() });

                if (results.length === 0) {
                    setError('Ce code QR n\'existe pas dans notre système');
                    setIsLoading(false);
                    return;
                }

                const qr = results[0];
                setQRCode(qr);

                // Redirection automatique si déjà activé
                if (qr.status === 'activated' && qr.memorial_id) {
                    navigate(createPageUrl('ViewMemorial', { id: qr.memorial_id }), { replace: true });
                    return;
                }

            } catch (e) {
                console.error('Erreur lors du chargement du QR code:', e);
                setError('Erreur lors de la vérification du code');
            }

            setIsLoading(false);
        };

        loadQRCode();
    }, [code, navigate]);

    const handleActivate = async () => {
        if (!qrCode || qrCode.status !== 'reserved' || !qrCode.memorial_id) return;

        setIsActivating(true);
        try {
            // Activer le QR code
            await api.entities.QRCode.update(qrCode.id, {
                status: 'activated',
                activated_at: new Date().toISOString()
            });

            // Activer le mémorial
            await api.entities.Memorial.update(qrCode.memorial_id, {
                is_activated: true
            });

            // Rediriger vers l'édition du mémorial
            navigate(createPageUrl('EditMemorial', { id: qrCode.memorial_id }), { replace: true });
        } catch (e) {
            console.error('Erreur lors de l\'activation:', e);
            setError('Erreur lors de l\'activation. Veuillez réessayer.');
            setIsActivating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    </div>
                    <p className="text-primary/60 text-lg">Vérification du code QR...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="font-serif text-2xl text-primary mb-4">Code non reconnu</h1>
                    <p className="text-primary/60 mb-8">{error}</p>
                    <Link to={createPageUrl('Home')}>
                        <Button className="btn-primary rounded-full px-8">
                            Retour à l'accueil
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Status: available - Le QR n'a pas encore été acheté
    if (qrCode?.status === 'available') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-accent" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-4">
                        Code non activé
                    </h1>
                    <p className="text-primary/60 mb-8 leading-relaxed">
                        Ce QR code n'a pas encore été associé à une commande.
                        <br />Si vous venez d'acheter une plaque, veuillez patienter quelques instants.
                    </p>
                    <div className="space-y-4">
                        <Link to={createPageUrl('Products')}>
                            <Button className="btn-accent rounded-full px-8 py-6 text-lg w-full">
                                Découvrir nos plaques
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Contact')}>
                            <Button variant="outline" className="rounded-full px-8 py-6 w-full border-primary/20 text-primary">
                                Contacter le support
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Status: reserved - Premier scan, activation nécessaire
    if (qrCode?.status === 'reserved') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary to-primary/90 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-lg bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl"
                >
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                        <Heart className="w-12 h-12 text-primary fill-current" />
                    </div>

                    <h1 className="font-serif text-3xl lg:text-4xl text-primary mb-4">
                        Bienvenue sur Memorialis
                    </h1>

                    <p className="text-primary/60 mb-8 leading-relaxed">
                        Votre plaque mémorielle est prête à être personnalisée.
                        <br />Cliquez ci-dessous pour activer votre espace et commencer à créer un hommage unique.
                    </p>

                    <div className="bg-background rounded-2xl p-6 mb-8 border border-primary/5">
                        <p className="text-xs text-primary/40 uppercase tracking-widest mb-2">
                            Votre code unique
                        </p>
                        <p className="font-mono text-2xl text-primary font-bold tracking-wider">
                            {qrCode.code}
                        </p>
                    </div>

                    <Button
                        onClick={handleActivate}
                        disabled={isActivating}
                        className="btn-accent w-full py-8 rounded-full text-xl font-bold shadow-xl shadow-accent/20"
                    >
                        {isActivating ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                Activation en cours...
                            </>
                        ) : (
                            <>
                                <Heart className="w-6 h-6 mr-3" />
                                Activer mon mémorial
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-primary/40 mt-6">
                        Conservez ce code précieusement, il vous permettra de modifier votre mémorial.
                    </p>
                </motion.div>
            </div>
        );
    }

    // Fallback - ne devrait pas arriver car les activated redirigent automatiquement
    return null;
}
