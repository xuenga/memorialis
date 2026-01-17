import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination or default to /admin
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

    // If already authenticated, redirect
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const success = login(password);

        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Mot de passe incorrect');
            setPassword('');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/20 mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Administration</h1>
                    <p className="text-primary/60">Connectez-vous pour accéder au panneau d'administration</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary/70">
                                Mot de passe administrateur
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="h-14 pl-4 pr-12 rounded-xl border-primary/10 bg-background/50 text-lg focus:ring-2 focus:ring-accent/30"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold text-lg shadow-lg shadow-primary/20 transition-all duration-300"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Se connecter'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-primary/40 text-sm mt-6">
                    Memorialis — Espace réservé aux administrateurs
                </p>
            </motion.div>
        </div>
    );
}
