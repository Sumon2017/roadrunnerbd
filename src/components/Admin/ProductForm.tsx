'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import slugify from 'slugify';
import { X, Upload, Trash2, Plus, Loader2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    order_index: number;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock_status: boolean;
    is_featured: boolean;
    images: string[];
}

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
    const [name, setName] = useState(product?.name || '');
    const [slug, setSlug] = useState(product?.slug || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || '');
    const [stockStatus, setStockStatus] = useState(product?.stock_status ?? true);
    const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
    const [images, setImages] = useState<string[]>(product?.images || []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch all categories
            const { data: catData } = await supabase.from('categories').select('*').order('name');
            setCategories(catData || []);

            // 2. If editing, fetch product's current categories
            if (product) {
                const { data: prodCatData } = await supabase
                    .from('product_categories')
                    .select('category_id')
                    .eq('product_id', product.id);

                if (prodCatData) {
                    setSelectedCategories(prodCatData.map(pc => pc.category_id));
                }
            }
        };
        fetchData();
    }, [product]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!product) {
            setSlug(slugify(val, { lower: true, strict: true }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const adminPass = localStorage.getItem('roadrunner_admin_pass') || '';
        const newImages = [...images];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);

            try {
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'admin-password': adminPass },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    newImages.push(data.url);
                } else {
                    const data = await response.json();
                    alert(`Failed to upload ${files[i].name}: ${data.error}`);
                }
            } catch (error) {
                console.error('Upload error:', error);
            }
        }

        setImages(newImages);
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const makeCover = (index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        const [selectedImage] = newImages.splice(index, 1);
        newImages.unshift(selectedImage);
        setImages(newImages);
    };

    const toggleCategory = (catId: string) => {
        if (selectedCategories.includes(catId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== catId));
        } else {
            setSelectedCategories([...selectedCategories, catId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            slug,
            description,
            price: parseFloat(price.toString()),
            stock_status: stockStatus,
            is_featured: isFeatured,
            images,
            categories: selectedCategories,
            ...(product && { id: product.id })
        };

        try {
            const adminPass = localStorage.getItem('roadrunner_admin_pass') || '';
            const response = await fetch('/api/admin/products', {
                method: product ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'admin-password': adminPass,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save product');
            }

            onSuccess();
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            alert('Error: ' + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-8 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Infrastructure / Inventory</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors uppercase font-bold tracking-tight"
                                    placeholder="e.g. Vintage Denim Jacket"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price (BDT)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors font-mono"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Slug</label>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 text-zinc-400 px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors font-mono text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-white transition-colors h-32 resize-none"
                                    placeholder="Detailed product information..."
                                />
                            </div>

                            <div className="flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={stockStatus}
                                        onChange={(e) => setStockStatus(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${stockStatus ? 'bg-white border-white' : 'border-zinc-700'}`}>
                                        {stockStatus && <div className="w-2 h-2 bg-black" />}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">In Stock</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${isFeatured ? 'bg-amber-500 border-amber-500' : 'border-zinc-700'}`}>
                                        {isFeatured && <div className="w-2 h-2 bg-black" />}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Featured</span>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter border transition-colors ${selectedCategories.includes(cat.id)
                                                ? 'bg-white text-black border-white'
                                                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Media */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Images</label>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer hover:text-zinc-300 transition-colors bg-zinc-800 px-3 py-1.5 rounded-sm">
                                        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                        {uploading ? 'Uploading...' : 'Upload Images'}
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square bg-black border border-zinc-800 group overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="p-1.5 bg-black/80 text-white rounded-full hover:bg-red-500"
                                                    title="Remove Image"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            {idx === 0 ? (
                                                <div className="absolute bottom-0 inset-x-0 bg-white text-black text-[8px] font-black uppercase text-center py-1">Cover</div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => makeCover(idx)}
                                                    className="absolute bottom-0 inset-x-0 bg-black/80 hover:bg-white hover:text-black text-white text-[8px] font-black uppercase text-center py-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                >
                                                    Make Cover
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!uploading && images.length === 0 && (
                                        <div className="aspect-square border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-2">
                                            <Upload size={24} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">No images</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-white text-black font-black uppercase tracking-tighter px-12 py-4 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
