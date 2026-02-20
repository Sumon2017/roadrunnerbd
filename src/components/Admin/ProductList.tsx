'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, Plus, Package, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/Admin/ProductForm';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock_status: boolean;
    is_featured: boolean;
    images: string[];
}

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1); // Reset back to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchProducts = async () => {
        setLoading(true);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let queryBuilder = supabase
            .from('products')
            .select('*', { count: 'exact' });

        if (debouncedQuery.trim()) {
            queryBuilder = queryBuilder.ilike('name', `%${debouncedQuery.trim()}%`);
        }

        const { data, error, count } = await queryBuilder
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [page, debouncedQuery]);

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const adminPass = localStorage.getItem('roadrunner_admin_pass') || '';
            const response = await fetch(`/api/admin/products?id=${productToDelete}`, {
                method: 'DELETE',
                headers: {
                    'admin-password': adminPass,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete product');
            }

            await fetchProducts();
            setProductToDelete(null);
            alert('Success: Product was deleted.');
        } catch (error: unknown) {
            console.error("DELETE request failed frontend trace:", error);
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            alert('Error deleting product: ' + message);
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Products</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Manage your store inventory</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search Products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest pl-10 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                    <button
                        onClick={openAddForm}
                        className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 font-black uppercase tracking-tighter text-sm hover:bg-zinc-200 transition-colors whitespace-nowrap"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-black/50 border-b border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Featured</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest animate-pulse">
                                    Loading Products...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest">
                                    No products found. Start by adding one.
                                </td>
                            </tr>
                        ) : (
                            products.map((prod) => (
                                <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black border border-zinc-800 rounded-sm flex items-center justify-center overflow-hidden">
                                                {prod.images?.[0] ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={16} className="text-zinc-700" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white uppercase tracking-tight">{prod.name}</div>
                                                <div className="text-[10px] font-mono text-zinc-500">{prod.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-white">
                                        ৳{prod.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${prod.stock_status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {prod.stock_status ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {prod.is_featured ? (
                                            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">Featured</span>
                                        ) : (
                                            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => openEditForm(prod)}
                                                className="p-2 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setProductToDelete(prod.id)}
                                                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchProducts}
                />
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} products
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <div className="flex items-center px-4 text-[10px] font-mono text-white">
                            {page} / {Math.ceil(totalCount / pageSize)}
                        </div>
                        <button
                            disabled={page >= Math.ceil(totalCount / pageSize)}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm max-w-sm w-full">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Delete Product</h3>
                        <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-8">
                            Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setProductToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-zinc-800 text-white font-black uppercase tracking-tighter text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-black uppercase tracking-tighter text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
