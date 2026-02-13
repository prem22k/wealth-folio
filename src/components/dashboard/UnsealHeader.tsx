'use client';

import React from 'react';
import UserAvatar from '@/components/ui/UserAvatar';
import { Bell } from 'lucide-react';

interface UnsealHeaderProps {
    title?: string;
    centerContent?: React.ReactNode;
    showSecureBadge?: boolean;
}

export default function UnsealHeader({ title = 'UNSEAL', centerContent, showSecureBadge = false }: UnsealHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 !bg-[#050505]/80 !backdrop-blur-xl">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-white">
                        {/* Using simpler lock icon or custom svg */}
                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-wider">{title}</h2>
                </div>

                {/* Center Content (e.g. Search) */}
                {centerContent && (
                    <div className="hidden md:flex flex-1 justify-center mx-8">
                        {centerContent}
                    </div>
                )}

                {/* Right Side: Badges & Profile */}
                <div className="flex items-center gap-6">
                    {showSecureBadge && (
                        <div className="hidden sm:flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 border border-emerald-500/20 bg-emerald-500/5">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Secure</span>
                            <span className="material-symbols-outlined text-emerald-400 text-[18px]">shield</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition-colors relative">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-[#0a0a0a]"></span>
                        </button>
                        <UserAvatar />
                    </div>
                </div>
            </div>
        </header>
    );
}
