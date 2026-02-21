'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/Branding/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import { supabase } from '@/lib/supabase';
import { Loader2, MapPin } from 'lucide-react';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 8;

  const fetchProducts = useCallback(async (isInitial = true) => {
    const startPage = isInitial ? 0 : page + 1;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // 1. Search Filter
      if (searchQuery) {
        const words = searchQuery.trim().split(/\s+/).filter(Boolean);
        words.forEach(word => {
          query = query.ilike('name', `%${word}%`);
        });
      }

      // 2. Category Filter
      if (activeCategory !== 'all') {
        // First get category ID
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', activeCategory)
          .single();

        if (catData) {
          const { data: prodIds } = await supabase
            .from('product_categories')
            .select('product_id')
            .eq('category_id', catData.id);

          if (prodIds) {
            const ids = prodIds.map(p => p.product_id);
            query = query.in('id', ids);
          }
        }
      }

      // 3. Pagination & Order
      const from = startPage * pageSize;
      const to = from + pageSize - 1;

      // Sort logic: Featured true first, then strictly chronological by created_at.
      // (Using updated_at here breaks the chronological history of unfeatured items if they are edited later)
      const { data, count, error } = await query
        .order('is_featured', { ascending: false })
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
  }, [activeCategory, searchQuery, page]);

  // Initial fetch on filters change
  useEffect(() => {
    fetchProducts(true);
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar
        logoUrl="/logo.png"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <HeroBanner backgroundImage="/hero-banner.jpg" />

      {/* Store Section */}
      <section id="store" className="max-w-7xl mx-auto px-4 py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Inventory</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Curated / Premium / Essential
            </p>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="mb-12 border-b border-zinc-900">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse border border-zinc-800 rounded-sm" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 transition-all duration-500">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.5em]">No products found</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-20 flex justify-center">
            <button
              onClick={() => fetchProducts(false)}
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
      </section>

      {/* Footer / About Placeholder */}
      <section id="about" className="max-w-7xl mx-auto px-4 py-20 border-t border-zinc-900">
        <div className="grid md:grid-cols-2 gap-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">RoadRunnerBD</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Premium e-commerce experience built for speed and reliability.
              Discover curated essentials delivered with direct attention to quality.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href="https://maps.app.goo.gl/pu3pBRs66WtPXSZo7"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 pt-4 hover:text-white transition-colors text-zinc-400 max-w-sm"
              >
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 group-hover:text-red-500 transition-colors" />
                <span className="text-sm leading-relaxed">
                  194, Shahid Milon Road,
                  <br />Dogair west para, Demra,
                  <br />Dhaka, Bangladesh
                </span>
              </a>

              <div className="w-full max-w-xs rounded-sm overflow-hidden border border-zinc-800 opacity-80 hover:opacity-100 transition-opacity">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3653.1556242650995!2d90.47578227511369!3d23.70613597870064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b700081c480b%3A0x167e1347e83240f3!2sRoadRunner%20BD!5e0!3m2!1sen!2sbd!4v1771656487055!5m2!1sen!2sbd"
                  width="100%"
                  height="120"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex flex-col gap-2 pt-2 md:pt-1.5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801629411444'}`.replace('+', '')} className="flex items-center gap-2 hover:text-white transition-colors group">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-emerald-500 group-hover:text-emerald-400 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+8801629411444';
                    navigator.clipboard.writeText(number);
                    alert(`Copied ${number} to clipboard`);
                  }}
                  className="text-zinc-600 font-mono tracking-normal text-[10px] ml-1 hover:text-white transition-colors cursor-copy select-text"
                  title="Click to copy number"
                >
                  ({process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+8801629411444'})
                </button>
              </div>

              <a href="https://www.facebook.com/RoadRunnerBD25/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors group">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-blue-500 group-hover:text-blue-400">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a href="https://www.instagram.com/roadrunnerbdofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors group">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-pink-500 group-hover:text-pink-400">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
