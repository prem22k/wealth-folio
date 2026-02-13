'use client';

import React from 'react';
import { motion } from 'framer-motion';
import UnsealDock from './UnsealDock';
import UnsealHeader from './UnsealHeader';
import CFO from './CFO';

interface DashboardShellProps {
    children: React.ReactNode;
    /**
     * Optional custom header content (like search bar)
     */
    headerCenterContent?: React.ReactNode;
    headerTitle?: string;
    showSecureBadge?: boolean;
    className?: string;
}

export default function DashboardShell({
    children,
    headerCenterContent,
    headerTitle = 'UNSEAL',
    showSecureBadge = false,
    className = ''
}: DashboardShellProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#050505] overflow-x-hidden pb-32">

            {/* Background Base (Consistent across all pages) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Solid Professional Slate Base */}
                <div className="absolute inset-0 bg-[#0B0C10]"></div>

                {/* Extremely Subtle Top Gradient (Professional Indigo) */}
                <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 to-transparent opacity-40"></div>
            </div>

            {/* Standard Header */}
            <UnsealHeader
                title={headerTitle}
                centerContent={headerCenterContent}
                showSecureBadge={showSecureBadge}
            />

            {/* Main Content Area */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
            >
                {children}
            </motion.main>

            {/* Unified Navigation Dock */}
            <UnsealDock />

            {/* CFO Agent Overlay */}
            <CFO />
        </div>
    );
}
