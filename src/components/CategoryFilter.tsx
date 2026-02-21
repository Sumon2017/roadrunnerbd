'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

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
        const scrollAmount = direction === 'left' ? -200 : 200;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

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
        <div className="relative group">
            {/* Left Scroll Gradient / Button */}
            {showLeftScroll && (
                <div className="absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 flex items-center justify-start pointer-events-none">
                    <button
                        onClick={() => scroll('left')}
                        className="pointer-events-auto h-8 w-8 ml-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>
            )}

            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar select-none relative z-10"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <button
                    onClick={() => onCategoryChange('all')}
                    className={`relative px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 ${activeCategory === 'all' ? 'text-black' : 'text-zinc-500 hover:text-white'
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
                        className={`relative px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap shrink-0 ${activeCategory === cat.slug ? 'text-black' : 'text-zinc-500 hover:text-white'
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

            {/* Right Scroll Gradient / Button */}
            {showRightScroll && (
                <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 flex items-center justify-end pointer-events-none">
                    <button
                        onClick={() => scroll('right')}
                        className="pointer-events-auto h-8 w-8 mr-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-lg"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryFilter;
