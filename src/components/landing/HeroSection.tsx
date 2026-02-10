'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="pt-32 pb-20 px-6 relative overflow-hidden obsidian-gradient">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-8 z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Privacy-First Local AI
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Unlock Your <br />
                        <span className="text-primary">Frozen Wealth</span> Data
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
                        Private, local decryption for your financial PDFs. Get AI-powered insights without your data ever leaving your machine. Secure by design.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all indigo-glow flex items-center justify-center">
                            Start Audit Free
                        </Link>
                        <button className="px-8 py-4 rounded-xl glass-card text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                            View Live Demo
                            <span className="material-symbols-outlined">play_circle</span>
                        </button>
                    </div>
                </div>
                {/* Hero Visual: 3D Tilted Glass Card */}
                <div className="relative z-10 flex justify-center lg:justify-end perspective-1000">
                    <div className="relative w-full max-w-md aspect-[4/3] glass-card rounded-2xl p-8 transform rotate-y-[-10deg] rotate-x-[5deg] shadow-2xl overflow-hidden border-white/20">
                        <div className="absolute top-0 right-0 p-6">
                            <span className="material-symbols-outlined text-cyan-400 opacity-50 text-4xl">monitoring</span>
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1">Estimated Runway</p>
                                <h3 className="text-5xl font-black text-white">3.5 Months</h3>
                                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    +12.4% from last period
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-full bg-white/5 rounded-lg flex items-center px-4 gap-3 border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-3/4 h-full bg-primary"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">Analysis 88%</span>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex -space-x-2">
                                        <div className="size-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] font-bold">AI</div>
                                        <div className="size-6 rounded-full bg-primary border border-slate-900 flex items-center justify-center text-[10px] font-bold">UN</div>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Verified Local Node</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative element behind the card */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>
                </div>
            </div>
        </section>
    );
}
