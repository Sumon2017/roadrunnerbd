'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock_status: boolean;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <Link href={`/product/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.1)]">
                {/* Image */}
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <ShoppingBag size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Stock Status Badge */}
                {!product.stock_status && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm z-10">
                        Sold Out
                    </div>
                )}

                {/* Featured Hint (Subtle) */}
                <div className="absolute top-3 right-3 text-white/20 group-hover:text-white transition-colors duration-700">
                    <ShoppingBag size={12} strokeWidth={3} />
                </div>

                {/* Quick Add Visual */}
                <div className="absolute bottom-4 inset-x-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                    <button className="w-full bg-white text-black text-[10px] font-black uppercase tracking-tighter py-3 hover:bg-black hover:text-white transition-colors border border-white">
                        Discovery / View
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-5 space-y-1.5 px-1">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 group-hover:text-white transition-colors duration-500 line-clamp-1">
                        {product.name}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-white/60 group-hover:text-white transition-colors duration-500 shrink-0">
                        ৳{product.price}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-[1px] w-4 bg-zinc-800 group-hover:w-8 transition-all duration-500"></div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-500">
                        RoadRunner / Premium
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
