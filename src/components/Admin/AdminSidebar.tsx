'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Branding/Logo';
import { Package, FolderTree, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
    active: 'dashboard' | 'products' | 'categories';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ active }) => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { id: 'products', label: 'Products', icon: Package, href: '/admin/dashboard/products' },
        { id: 'categories', label: 'Categories', icon: FolderTree, href: '/admin/dashboard/categories' },
    ];

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-0 left-0 z-50 p-6 text-white hover:text-zinc-300 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-black border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                    <NextLink href="/" onClick={() => setIsOpen(false)}>
                        <Logo />
                    </NextLink>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-zinc-500 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
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
        </>
    );
};

export default AdminSidebar;
