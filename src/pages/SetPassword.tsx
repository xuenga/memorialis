import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PasswordInput } from '@/components/ui/password-input';
import { translateAuthError } from '@/lib/authErrors';

export default function SetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Supabase automatically handles the token from the URL hash
        // When arriving via an invite link, the session is established if valid
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setIsValidToken(true);
            } else {
                // Check if we're in the process of exchanging the token
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        setIsValidToken(true);
                    } else if (event === 'TOKEN_REFRESHED') {
                        setIsValidToken(true);
                    }
                });

                // Wait a bit for the token exchange
                setTimeout(async () => {
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (!sessionData.session) {
                        setIsValidToken(false);
                    }
                }, 2000);

                return () => subscription.unsubscribe();
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
                toast.error(translateAuthError(error));
            } else {
                setIsSuccess(true);
                toast.success("Votre compte est maintenant activé !");
                setTimeout(() => {
                    navigate('/my-memorials');
                }, 3000);
            }
        } catch (error) {
            console.error('Error setting password:', error);
            toast.error("Une erreur est survenue lors de la création du mot de passe.");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state while checking token
    if (isValidToken === null) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                    <p className="text-primary/60">Vérification de votre lien...</p>
                </motion.div>
            </div>
        );
    }

    // Invalid or expired token
    if (isValidToken === false) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 text-center border border-primary/5"
                >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="font-serif text-3xl text-primary mb-4">Lien expiré</h2>
                    <p className="text-primary/60 mb-8">
                        Ce lien d'activation a expiré ou est invalide. Veuillez contacter notre support si vous avez besoin d'aide pour accéder à votre compte.
                    </p>
                    <Button onClick={() => navigate('/contact')} className="w-full h-14 rounded-full font-bold">
                        Contacter le support
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Success state
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
                    <h2 className="font-serif text-3xl text-primary mb-4">Bienvenue ! 🎉</h2>
                    <p className="text-primary/60 mb-8">
                        Votre compte est maintenant actif. Vous allez être redirigé vers vos mémoriaux dans quelques instants.
                    </p>
                    <Button onClick={() => navigate('/my-memorials')} className="w-full h-14 rounded-full font-bold">
                        Accéder à mes mémoriaux
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
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Bienvenue sur Memorialis !</h1>
                    <p className="text-primary/60">
                        Créez votre mot de passe pour accéder à votre espace personnel et gérer votre mémorial.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Créer un mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 z-10" />
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 pl-12 pr-12 rounded-2xl border-primary/10 focus:border-accent"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 z-10" />
                            <PasswordInput
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 pl-12 pr-12 rounded-2xl border-primary/10 focus:border-accent"
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
                                Activation en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Activer mon compte
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-3 border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Votre mot de passe doit contenir au moins 6 caractères. Nous vous conseillons d'utiliser un mot de passe unique et sécurisé.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
