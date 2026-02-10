'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">shield_lock</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">UNSEAL</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Product</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Features</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Security</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">GitHub</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/register" className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-all">
                        Start Audit Free
                    </Link>
                </div>
            </div>
        </nav>
    );
}
