'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Branding/Logo';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            router.push('/admin/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-sm shadow-2xl"
            >
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2 text-center">
                    Admin Access
                </h2>
                <p className="text-zinc-500 text-xs text-center uppercase tracking-widest mb-8 font-bold">
                    Enter Password to Continue
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full bg-black border ${error ? 'border-red-500 animate-shake' : 'border-zinc-800'} text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors text-center tracking-widest`}
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                                Invalid Password
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-black uppercase tracking-tighter py-3 hover:bg-zinc-200 transition-colors"
                    >
                        Authenticate
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <a href="/" className="text-zinc-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                        Back to Storefront
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
