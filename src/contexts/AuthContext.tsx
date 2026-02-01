import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Sync with localStorage for legacy api.auth.me() calls
            if (session?.user) {
                localStorage.setItem('memorialis_user', JSON.stringify({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email,
                    role: session.user.user_metadata?.role || 'user'
                }));
            } else {
                localStorage.removeItem('memorialis_user');
            }

            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Sync with localStorage for legacy api.auth.me() calls
            if (session?.user) {
                localStorage.setItem('memorialis_user', JSON.stringify({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email,
                    role: session.user.user_metadata?.role || 'user'
                }));
            } else {
                localStorage.removeItem('memorialis_user');
            }

            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                return { user: null, error };
            }

            return { user: data.user, error: null };
        } catch (error) {
            return {
                user: null,
                error: error as AuthError
            };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { user: null, error };
            }

            return { user: data.user, error: null };
        } catch (error) {
            return {
                user: null,
                error: error as AuthError
            };
        }
    };

    const signOut = async () => {
        console.log('SignOut called - starting logout process...');
        try {
            // Force clean localStorage first
            localStorage.removeItem('memorialis_user');
            console.log('localStorage cleaned');

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Supabase signOut error:', error);
            } else {
                console.log('Supabase signOut successful');
            }

            // Force state reset
            setUser(null);
            setSession(null);

            // Force page reload to ensure clean state
            window.location.href = '/';
        } catch (error) {
            console.error('SignOut error:', error);
            // Force reload anyway
            localStorage.removeItem('memorialis_user');
            window.location.href = '/';
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            return { error };
        } catch (error) {
            return { error: error as AuthError };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signUp,
                signIn,
                signOut,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
