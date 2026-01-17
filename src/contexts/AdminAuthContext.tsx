import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => boolean;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'memorialis_admin_auth';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already authenticated from localStorage
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string): boolean => {
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (password === adminPassword) {
            setIsAuthenticated(true);
            localStorage.setItem(AUTH_STORAGE_KEY, 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
