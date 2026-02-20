'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedPass = localStorage.getItem('roadrunner_admin_pass');
        // We'll verify against the env variable via an API route later if needed, 
        // but for now, we'll check if a pass exists.
        if (savedPass) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string) => {
        // In a real app, we'd call an API. Here we check the env-provided pass.
        // Since env vars are client-side only if prefixed with NEXT_PUBLIC_, 
        // we'll handle the actual validation via a simple check or API.
        const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || 'harunzaman';

        if (password === adminPass) {
            localStorage.setItem('roadrunner_admin_pass', password);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('roadrunner_admin_pass');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
