import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';
import { translateAuthError } from '@/lib/authErrors';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);

        try {
            const { user, error } = await signIn(email, password);

            if (error) {
                toast.error(translateAuthError(error));
                setIsLoading(false);
                return;
            }

            if (user) {
                toast.success('Connexion réussie !');
                // Redirect to my-memorials or previous page
                const from = (location.state as any)?.from?.pathname || '/my-memorials';
                navigate(from);
            }
        } catch (error) {
            toast.error('Une erreur est survenue');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/5"
            >
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Connexion</h1>
                    <p className="text-primary/60">Connectez-vous à votre compte Memorialis</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className="h-14 pl-12 rounded-2xl border-primary/10 focus:border-accent"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 z-10" />
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-14 pl-12 pr-12 rounded-2xl border-primary/10 focus:border-accent"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-accent hover:text-accent/80 transition"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-full font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-5 w-5" />
                                Se connecter
                            </>
                        )}
                    </Button>

                    <div className="text-center text-sm pt-4">
                        <span className="text-primary/60">Pas encore de compte ?</span>{' '}
                        <Link
                            to="/signup"
                            className="font-medium text-accent hover:text-accent/80 transition"
                        >
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
