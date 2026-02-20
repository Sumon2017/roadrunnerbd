'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import slugify from 'slugify';
import { X } from 'lucide-react';

interface CategoryFormProps {
    category?: any;
    onClose: () => void;
    onSuccess: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose, onSuccess }) => {
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [orderIndex, setOrderIndex] = useState(category?.order_index || 0);
    const [loading, setLoading] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!category) {
            setSlug(slugify(val, { lower: true, strict: true }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            slug,
            order_index: orderIndex,
            ...(category && { id: category.id })
        };

        try {
            const adminPass = localStorage.getItem('roadrunner_admin_pass') || '';
            const response = await fetch('/api/admin/categories', {
                method: category ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'admin-password': adminPass,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save category');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-8 rounded-sm overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black uppercase tracking-tighter">
                        {category ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors"
                            placeholder="e.g. Streetwear"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full bg-black border border-zinc-800 text-zinc-400 px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors"
                            placeholder="streetwear"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Order Index</label>
                        <input
                            type="number"
                            value={orderIndex}
                            onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                            className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-black uppercase tracking-tighter py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Category'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
