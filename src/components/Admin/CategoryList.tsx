'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, Plus, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryForm from './CategoryForm';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Scroll state
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('categories')
            .select('*', { count: 'exact' })
            .order('order_index', { ascending: true })
            .range(from, to);

        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            setCategories(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [page]);

    // Scroll handlers
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftScroll(scrollLeft > 0);
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = direction === 'left' ? -300 : 300;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            const adminPass = localStorage.getItem('roadrunner_admin_pass') || '';
            const response = await fetch(`/api/admin/categories?id=${categoryToDelete}`, {
                method: 'DELETE',
                headers: {
                    'admin-password': adminPass,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete category');
            }

            await fetchCategories();
            setCategoryToDelete(null);
            alert('Success: Category was deleted.');
        } catch (error: any) {
            console.error("DELETE request failed frontend trace:", error);
            alert('Error deleting category: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddForm = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEditForm = (category: any) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Categories</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Manage your product groups</p>
                </div>
                <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 font-black uppercase tracking-tighter text-sm hover:bg-zinc-200 transition-colors"
                >
                    <Plus size={16} /> Add Category
                </button>
            </div>

            <div className="relative group">
                {/* Left Scroll Gradient / Button */}
                {showLeftScroll && (
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 flex items-center justify-start pointer-events-none md:hidden">
                        <button
                            onClick={() => scroll('left')}
                            className="pointer-events-auto h-8 w-8 ml-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden overflow-x-auto no-scrollbar relative z-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-black/50 border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Order</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Slug</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest animate-pulse">
                                        Loading Categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest">
                                        No categories found. Start by adding one.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 font-mono text-zinc-400 group-hover:text-white transition-colors">
                                            {cat.order_index}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white uppercase tracking-tight">
                                            {cat.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                                            {cat.slug}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditForm(cat)}
                                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setCategoryToDelete(cat.id)}
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

                {/* Right Scroll Gradient / Button */}
                {showRightScroll && (
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 flex items-center justify-end pointer-events-none md:hidden">
                        <button
                            onClick={() => scroll('right')}
                            className="pointer-events-auto h-8 w-8 mr-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <CategoryForm
                    category={editingCategory}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchCategories}
                />
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} categories
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
            {categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm max-w-sm w-full">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Delete Category</h3>
                        <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-8">
                            Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setCategoryToDelete(null)}
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

export default CategoryList;
