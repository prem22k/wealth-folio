'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-background-dark pt-20 pb-10 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg">shield_lock</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase">UNSEAL</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
                            The ultimate local AI tool for wealth management. Privacy isn&apos;t a feature, it&apos;s our core architecture.
                        </p>
                        <div className="flex gap-4">
                            <Link className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">public</span></Link>
                            <Link className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">code</span></Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">Product</h4>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Pricing</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Integrations</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Desktop App</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Documentation</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">Company</h4>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">About Us</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Security</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Privacy Policy</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Terms of Service</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">Open Source</h4>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">GitHub Repo</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">Contributors</Link>
                        <Link className="text-slate-500 text-sm hover:text-white transition-colors" href="#">SDK</Link>
                    </div>
                </div>
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-600 text-xs">
                        © 2024 Unseal Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">lock</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secured by Firebase</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10">
                            <span className="material-symbols-outlined text-[14px] text-primary">psychology</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">llama 3.3 70b local</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
