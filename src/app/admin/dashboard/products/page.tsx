'use client';

import React from 'react';
import ProductList from '@/components/Admin/ProductList';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const ProductsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white flex">
            <AdminSidebar active="products" />

            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8">
                    <h1 className="text-xl font-black uppercase tracking-tighter text-zinc-400">Dashboard / <span className="text-white">Products</span></h1>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Inventory Management</div>
                    </div>
                </header>

                <div className="p-8">
                    <ProductList />
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;
