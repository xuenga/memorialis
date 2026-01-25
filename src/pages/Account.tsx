import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function Account() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Mon Compte
                </h1>
                <p className="text-gray-600">
                    Gérez vos informations personnelles
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-1">
                                {user.user_metadata?.full_name || 'Utilisateur'}
                            </h2>
                            <p className="text-blue-100">
                                Membre depuis {formatDate(user.created_at || '')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                            <p className="text-lg text-gray-900">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Statut du compte</h3>
                            <p className="text-lg text-gray-900">
                                {user.email_confirmed_at ? (
                                    <span className="inline-flex items-center gap-2 text-green-600">
                                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                        Email vérifié
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-orange-600">
                                        <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                                        Email non vérifié
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Dernière connexion</h3>
                            <p className="text-lg text-gray-900">
                                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Astuce</h3>
                <p className="text-blue-700 text-sm">
                    Vous pouvez maintenant créer et gérer vos mémoriaux depuis la section{' '}
                    <a href="/my-memorials" className="underline font-medium">
                        Mes Mémoriaux
                    </a>.
                </p>
            </div>
        </div>
    );
}
