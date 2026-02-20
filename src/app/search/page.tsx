'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const pageSize = 12;

    const fetchResults = async (isInitial = true) => {
        const startPage = isInitial ? 0 : page + 1;
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let queryBuilder = supabase.from('products').select('*', { count: 'exact' });

            const words = query.trim().split(/\s+/).filter(Boolean);
            words.forEach(w => {
                queryBuilder = queryBuilder.ilike('name', `%${w}%`);
            });

            const from = startPage * pageSize;
            const to = from + pageSize - 1;

            const { data, count, error } = await queryBuilder
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (isInitial) {
                setProducts(data || []);
            } else {
                setProducts(prev => [...prev, ...(data || [])]);
            }

            setHasMore(count ? (startPage + 1) * pageSize < count : false);
            setPage(startPage);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            setHasMore(false);
            return;
        }
        fetchResults(true);
    }, [query]);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar logoUrl="/logo.png" />

            <section className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                <div className="mb-12 border-b border-zinc-900 pb-8">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                        Search Results
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                        Showing results for &quot;{query}&quot;
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-zinc-500" size={32} />
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 transition-all duration-500">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-20 flex justify-center">
                                <button
                                    onClick={() => fetchResults(false)}
                                    disabled={loadingMore}
                                    className="group flex items-center gap-3 bg-white text-black px-12 py-4 font-black uppercase tracking-tighter text-sm hover:bg-black hover:text-white border border-white transition-all duration-300"
                                >
                                    {loadingMore ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        'Load More'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 text-center border border-zinc-900 bg-zinc-950/50 rounded-sm">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">No products found matching &quot;{query}&quot;</p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-black">
                <Navbar logoUrl="/logo.png" />
                <div className="pt-32 pb-20 flex justify-center"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>
            </main>
        }>
            <SearchResults />
        </Suspense>
    );
}
