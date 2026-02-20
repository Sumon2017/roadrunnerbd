import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import ProductGallery from '@/components/ProductGallery';
import Link from 'next/link';
import { ChevronRight, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import ClientWhatsAppButton from '@/components/ClientWhatsAppButton';

interface Props {
    params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.name} | RoadRunnerBD`,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at RoadRunnerBD`,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images?.[0] ? [{ url: product.images[0] }] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    // 2. Fetch Product Data
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!product) notFound();

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar logoUrl="/logo.png" />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <ChevronRight size={10} />
                    <Link href="/#store" className="hover:text-white transition-colors">Store</Link>
                    <ChevronRight size={10} />
                    <span className="text-white">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left: Gallery (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32">
                            <ProductGallery images={product.images} />
                        </div>
                    </div>

                    {/* Right: Info (7 cols) */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                                <span className="text-3xl font-mono font-bold text-white">
                                    ৳{product.price}
                                </span>
                                {!product.stock_status && (
                                    <span className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-red-500/20">
                                        Sold Out
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                                {product.description || "No description available for this premium product."}
                            </p>
                        </div>

                        {/* Order Options */}
                        <div className="space-y-4 pt-6">
                            <ClientWhatsAppButton productName={product.name} productSlug={product.slug} stockStatus={product.stock_status} />
                            <p className="text-[9px] text-center text-zinc-500 font-bold uppercase tracking-widest">
                                Instant delivery in Dhaka / Nationwide shipping available
                            </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-10 border-t border-zinc-900">
                            <div className="flex items-center gap-3">
                                <Truck className="text-white" size={20} />
                                <div className="space-y-0.5">
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-white">Fast Delivery</span>
                                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">24-72 Hours</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-white" size={20} />
                                <div className="space-y-0.5">
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-white">Direct Import</span>
                                    <span className="block text-[8px] text-zinc-500 font-bold uppercase">100% Authentic</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
