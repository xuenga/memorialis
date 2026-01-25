import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, Loader2, KeyRound } from 'lucide-react';
import { translateAuthError } from '@/lib/authErrors';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Veuillez entrer votre email');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await resetPassword(email);

            if (error) {
                toast.error(translateAuthError(error));
                setIsLoading(false);
                return;
            }

            setEmailSent(true);
            toast.success('Email de réinitialisation envoyé !');
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 text-center border border-primary/5"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="font-serif text-3xl text-primary mb-4">Email envoyé !</h2>
                    <p className="text-primary/60 mb-8">
                        Nous avons envoyé un lien de réinitialisation à <strong className="text-primary">{email}</strong>.
                        Vérifiez votre boîte de réception et suivez les instructions.
                    </p>
                    <Link to="/login">
                        <Button variant="outline" className="w-full h-14 rounded-full font-bold gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Retour à la connexion
                        </Button>
                    </Link>
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
                        <KeyRound className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="font-serif text-3xl text-primary mb-2">Mot de passe oublié ?</h1>
                    <p className="text-primary/60">Entrez votre email pour recevoir un lien de réinitialisation</p>
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

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-full font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            'Envoyer le lien de réinitialisation'
                        )}
                    </Button>

                    <div className="text-center pt-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-accent transition font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
