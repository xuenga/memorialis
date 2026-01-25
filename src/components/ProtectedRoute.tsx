import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Vérification...</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated AND has admin role
    const isAdmin = user?.user_metadata?.role === 'admin';

    if (!user || !isAdmin) {
        // Redirect to login page if not authenticated or not admin
        return <Navigate to="/login" state={{ from: location, requiresAdmin: true }} replace />;
    }

    return <>{children}</>;
}
