'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package, FolderTree, AlertTriangle, LayoutDashboard, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import { supabase } from '@/lib/supabase';

const DashboardHome: React.FC = () => {
    const { logout } = useAuth();
    const [counts, setCounts] = useState({ products: 0, categories: 0, outOfStock: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    { count: productsCount },
                    { count: categoriesCount },
                    { count: outOfStockCount }
                ] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('categories').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock_status', false)
                ]);

                setCounts({
                    products: productsCount || 0,
                    categories: categoriesCount || 0,
                    outOfStock: outOfStockCount || 0
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Total Products', value: loading ? '...' : counts.products.toString(), icon: Package },
        { label: 'Categories', value: loading ? '...' : counts.categories.toString(), icon: FolderTree },
        { label: 'Out of Stock', value: loading ? '...' : counts.outOfStock.toString(), icon: AlertTriangle, color: 'text-red-500' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            <AdminSidebar active="dashboard" />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8">
                    <h1 className="text-xl font-black uppercase tracking-tighter">Dashboard Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Admin Session Active</div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <stat.icon size={20} className="text-zinc-500" />
                                    <span className={`text-2xl font-black ${stat.color || 'text-white'}`}>
                                        {stat.value}
                                    </span>
                                </div>
                                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</h3>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DashboardHome;
