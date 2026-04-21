import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/apiClient';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PendingQRHandler() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        const handlePendingActivation = async () => {
            // Uniquement si l'utilisateur est connecté et qu'on n'est pas déjà en train d'activer
            if (!user || isLoading || isActivating) return;

            const pendingCode = localStorage.getItem('pending_qr_code');
            if (pendingCode) {
                setIsActivating(true);
                toast.loading('Activation de votre plaque en cours...');
                
                try {
                    const result = await api.functions.activateMemorial(pendingCode);
                    
                    if (result.success || result.memorial_id) {
                        toast.dismiss();
                        toast.success('Plaque activée avec succès !');
                        localStorage.removeItem('pending_qr_code');
                        
                        // Rediriger vers l'espace de personnalisation
                        navigate(createPageUrl('EditMemorial', { id: result.memorial_id }), { replace: true });
                    } else {
                        throw new Error(result.message || 'Erreur inconnue');
                    }
                } catch (error: any) {
                    toast.dismiss();
                    console.error('Erreur lors de l\'activation automatique:', error);
                    toast.error('Impossible d\'activer automatiquement la plaque. Veuillez réessayer.');
                    
                    // On ne supprime pas forcément le code s'il y a une erreur temporaire, 
                    // mais si c'est une erreur définitive (déjà activé), on pourrait le supprimer.
                    // Pour l'instant, laissons l'utilisateur réessayer ou contacter le support.
                    localStorage.removeItem('pending_qr_code'); 
                } finally {
                    setIsActivating(false);
                }
            }
        };

        handlePendingActivation();
    }, [user, isLoading, isActivating, navigate]);

    return null; // Composant invisible
}
