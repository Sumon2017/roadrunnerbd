'use client';

import React from 'react';
import Logo from './Branding/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, ShoppingBag } from 'lucide-react';

interface NavbarProps {
    logoUrl?: string;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ logoUrl, searchQuery, onSearchChange }) => {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [localQuery, setLocalQuery] = React.useState(searchQuery || '');
    const [debouncedQuery, setDebouncedQuery] = React.useState('');
    const [results, setResults] = React.useState<any[]>([]);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Sync external searchQuery if it changes (for backward compatibility if needed)
    React.useEffect(() => {
        if (searchQuery !== undefined) setLocalQuery(searchQuery);
    }, [searchQuery]);

    // Debounce localQuery
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(localQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [localQuery]);

    // Fetch on debounce
    React.useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            let queryBuilder = supabase.from('products').select('id, name, slug, price, images');

            const words = debouncedQuery.trim().split(/\s+/).filter(Boolean);
            words.forEach(w => {
                queryBuilder = queryBuilder.ilike('name', `%${w}%`);
            });

            const { data } = await queryBuilder.limit(5);

            if (data) setResults(data);
            setIsLoading(false);
        };

        fetchResults();
    }, [debouncedQuery]);

    // Click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        if (localQuery.trim()) {
            setShowDropdown(false);
            setIsMobileSearchOpen(false);
            router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
        }
    };

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        const element = document.getElementById(hash);
        if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${hash}`);
        }
    };

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav ref={dropdownRef} className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isScrolled
            ? 'bg-black/60 backdrop-blur-xl border-white/5 py-4'
            : 'bg-transparent border-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 md:gap-8">
                {/* Logo Section */}
                <div className="flex-shrink-0">
                    <Link href="/">
                        <Logo imageUrl={logoUrl} />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <Link href="/" className="text-white hover:text-white transition-colors">Home</Link>
                    <Link href="/#store" onClick={(e) => handleSmoothScroll(e, 'store')} className="hover:text-white transition-colors">Store</Link>
                    <Link href="/#about" onClick={(e) => handleSmoothScroll(e, 'about')} className="hover:text-white transition-colors">About</Link>
                </div>

                <div className="hidden md:flex flex-1 max-w-md relative">
                    <form onSubmit={handleSearchSubmit} className="w-full relative group">
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                            <Search size={14} />
                        </button>
                        <input
                            type="text"
                            placeholder="Search Products..."
                            value={localQuery}
                            onChange={(e) => {
                                setLocalQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest pl-10 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-white/20 focus:bg-zinc-900 transition-all"
                        />
                    </form>

                    {/* Search Recommendations Dropdown */}
                    {showDropdown && localQuery.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 shadow-2xl rounded-sm overflow-hidden z-50 flex flex-col">
                            {isLoading ? (
                                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center animate-pulse">
                                    Searching...
                                </div>
                            ) : results.length > 0 ? (
                                <>
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.slug}`}
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 p-3 hover:bg-zinc-900 border-b border-zinc-800/50 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-zinc-900 shrink-0 overflow-hidden relative">
                                                {product.images?.[0] && (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 truncate">
                                                <span className="text-white text-xs font-bold truncate">{product.name}</span>
                                                <span className="text-zinc-500 text-[10px] font-mono">৳{product.price}</span>
                                            </div>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="p-3 w-full text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                                    >
                                        See all results for &quot;{localQuery}&quot;
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">
                                    No products found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2 md:gap-5">
                    <button
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className={`p-2 transition-colors relative md:hidden ${isMobileSearchOpen ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <Search size={18} />
                    </button>

                    <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                        <ShoppingBag size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
                    </button>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <Link href="/admin/dashboard" className="text-zinc-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest">
                        Admin
                    </Link>
                </div>
            </div>

            {/* Mobile Search Dropdown */}
            {isMobileSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-4 md:hidden shadow-2xl">
                    <form onSubmit={handleSearchSubmit} className="w-full relative group">
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                            <Search size={14} />
                        </button>
                        <input
                            type="text"
                            placeholder="Search Products..."
                            value={localQuery}
                            onChange={(e) => {
                                setLocalQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            autoFocus
                            className="w-full bg-black border border-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-white/20 transition-all"
                        />
                    </form>

                    {/* Mobile Search Recommendations */}
                    {showDropdown && localQuery.trim() !== '' && (
                        <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden flex flex-col max-h-[60vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center animate-pulse">
                                    Searching...
                                </div>
                            ) : results.length > 0 ? (
                                <>
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.slug}`}
                                            onClick={() => {
                                                setShowDropdown(false);
                                                setIsMobileSearchOpen(false);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-zinc-800 border-b border-zinc-700/50 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-black shrink-0 overflow-hidden relative border border-zinc-800">
                                                {product.images?.[0] && (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 truncate">
                                                <span className="text-white text-xs font-bold truncate">{product.name}</span>
                                                <span className="text-zinc-500 text-[10px] font-mono">৳{product.price}</span>
                                            </div>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="p-3 w-full text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        See all results for &quot;{localQuery}&quot;
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">
                                    No products found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
