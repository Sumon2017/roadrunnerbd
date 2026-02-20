'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Branding/Logo';
import { Package, FolderTree, LogOut, LayoutDashboard, Link } from 'lucide-react';
import NextLink from 'next/link';

interface AdminSidebarProps {
    active: 'dashboard' | 'products' | 'categories';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ active }) => {
    const { logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { id: 'products', label: 'Products', icon: Package, href: '/admin/dashboard/products' },
        { id: 'categories', label: 'Categories', icon: FolderTree, href: '/admin/dashboard/categories' },
    ];

    return (
        <aside className="w-64 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
            <div className="p-8 border-b border-zinc-800">
                <NextLink href="/">
                    <Logo />
                </NextLink>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NextLink
                        key={item.id}
                        href={item.href}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors ${active === item.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <item.icon size={16} /> {item.label}
                    </NextLink>
                ))}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors rounded-sm font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
