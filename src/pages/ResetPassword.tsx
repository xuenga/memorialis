import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Dans Supabase, quand on arrive via un lien de reset, 
        // la session est automatiquement établie si le token est valide.
        // On vérifie juste si on a une session ou si on est sur la bonne page.
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                // Si pas de session, c'est que le lien a expiré ou est invalide
                toast.error("Le lien de récupération semble invalide ou a expiré.");
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error(error.message);
            } else {
                setIsSuccess(true);
                toast.success("Mot de passe mis à jour avec succès !");
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error("Une erreur est survenue lors de la réinitialisation.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 text-center border border-primary/5"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="font-serif text-3xl text-primary mb-4">Succès !</h2>
                    <p className="text-primary/60 mb-8">
                        Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la page de connexion dans quelques instants.
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full h-14 rounded-full font-bold">
                        Se connecter maintenant
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5"
            >
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Nouveau mot de passe</h1>
                    <p className="text-primary/60">Définissez votre nouveau mot de passe sécurisé</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 pl-12 rounded-2xl border-primary/10 focus:border-accent"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 pl-12 rounded-2xl border-primary/10 focus:border-accent"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-full font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Mise à jour...
                            </>
                        ) : (
                            'Réinitialiser le mot de passe'
                        )}
                    </Button>
                </form>

                <div className="mt-8 p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Pour votre sécurité, choisissez un mot de passe que vous n'utilisez pas ailleurs. Il doit contenir au moins 6 caractères.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
