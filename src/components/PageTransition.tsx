'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a "premium" feel
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
