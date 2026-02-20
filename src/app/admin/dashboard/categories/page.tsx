'use client';

import React from 'react';
import CategoryList from '@/components/Admin/CategoryList';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const CategoriesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex">
            <AdminSidebar active="categories" />

            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8">
                    <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-400">Dashboard / <span className="text-white">Categories</span></h1>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Manage Groups</div>
                    </div>
                </header>

                <div className="p-8">
                    <CategoryList />
                </div>
            </main>
        </div>
    );
};

export default CategoriesPage;
