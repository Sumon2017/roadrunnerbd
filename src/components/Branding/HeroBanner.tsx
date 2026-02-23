'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroBanner: React.FC<{ backgroundImage?: string }> = ({ backgroundImage }) => {
    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image / Premium CSS Fallback */}
            {backgroundImage ? (
                <img
                    src={backgroundImage}
                    alt="Banner"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                />
            ) : (
                <div className="absolute inset-0 bg-black overflow-hidden">
                    {/* Animated "Street" Texture Fallback */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 opacity-90" />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.4, 0.3]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                </div>
            )}

            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Animated Overlay */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center px-4"
            >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest text-zinc-400 uppercase border border-zinc-800 rounded-full">
                    New Arrival
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white/70 tracking-tighter leading-none mb-6">
                    PREMIUM <br />
                    <span className="text-zinc-500/70">BIKE ACCESSORIES</span>
                </h1>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => {
                            const storeSection = document.getElementById('store');
                            if (storeSection) {
                                storeSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="px-8 py-3 bg-white text-black font-bold uppercase tracking-tighter hover:bg-zinc-200 transition-colors w-full md:w-auto text-center"
                    >
                        Explore Collection
                    </button>
                </div>
            </motion.div>

            {/* Decorative lines / Glassmorphism effect */}
            <div className="absolute top-0 right-0 w-1/3 h-full border-r border-white/5 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/3 border-b border-white/5 pointer-events-none" />
        </section>
    );
};

export default HeroBanner;
