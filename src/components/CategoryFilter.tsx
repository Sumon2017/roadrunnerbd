'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoryFilterProps {
    activeCategory: string;
    onCategoryChange: (slug: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, onCategoryChange }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, slug')
                .order('order_index', { ascending: true });

            if (!error && data) {
                setCategories(data);
            }
            setLoading(false);
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-24 bg-zinc-900 animate-pulse rounded-sm border border-zinc-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar select-none">
            <button
                onClick={() => onCategoryChange('all')}
                className={`relative px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${activeCategory === 'all' ? 'text-black' : 'text-zinc-500 hover:text-white'
                    }`}
            >
                {activeCategory === 'all' && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <span className="relative z-10">All</span>
            </button>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.slug)}
                    className={`relative px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${activeCategory === cat.slug ? 'text-black' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    {activeCategory === cat.slug && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white rounded-sm"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{cat.name}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
