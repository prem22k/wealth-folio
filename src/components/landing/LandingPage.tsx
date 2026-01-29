'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden">
            {/* Navbar */}
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

            {/* Hero Section */}
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

            {/* Bento Grid Section */}
            <section className="py-24 px-6 bg-background-dark">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-4 mb-16 text-center">
                        <h2 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
                            The Privacy-First AI Financial Engine
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Advanced local processing meets enterprise-grade security. No cloud storage, no data mining.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                        {/* Card 1: Bypasses PDF Encryption */}
                        <div className="md:col-span-8 group glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-default">
                            <div className="flex flex-col gap-6">
                                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                    <span className="material-symbols-outlined">lock_open</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Bypasses PDF Encryption</h3>
                                    <p className="text-slate-400 max-w-md leading-relaxed">
                                        Seamlessly unlock and process password-protected financial statements locally. No need to manually decrypt files—Unseal handles 256-bit AES encryption natively.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-2">
                                <div className="h-1 bg-primary w-24 rounded-full"></div>
                                <div className="h-1 bg-white/10 w-12 rounded-full"></div>
                                <div className="h-1 bg-white/10 w-8 rounded-full"></div>
                            </div>
                        </div>
                        {/* Card 2: PII Redaction */}
                        <div className="md:col-span-4 group glass-card rounded-2xl p-8 flex flex-col items-center text-center justify-center hover:border-primary/50 transition-colors cursor-default">
                            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
                                <span className="material-symbols-outlined text-4xl">shield_person</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">PII Redaction Layer</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Your personally identifiable information never leaves your device. Local redaction ensures your SSN and account numbers stay yours.
                            </p>
                        </div>
                        {/* Card 3: Vampire Cost Detector */}
                        <div className="md:col-span-5 group glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-cyan-500/50 transition-colors cursor-default">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                                    <span className="material-symbols-outlined">mist</span>
                                </div>
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded">Active Audit</span>
                            </div>
                            <div className="mt-auto">
                                <h3 className="text-xl font-bold text-white mb-2">Vampire Cost Detector</h3>
                                <p className="text-slate-400 text-sm">
                                    Identify hidden subscription drains and unnecessary service fees automatically.
                                </p>
                            </div>
                        </div>
                        {/* Card 4: Chat with your CFO */}
                        <div className="md:col-span-7 group glass-card rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center hover:border-primary/50 transition-colors cursor-default">
                            <div className="flex-1 order-2 md:order-1">
                                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4 border border-primary/30">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Chat with your CFO</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    Interactive AI insights to help you manage your wealth like a pro. Ask questions about your spending patterns, tax liabilities, and future projections.
                                </p>
                                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                    Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <div className="w-full md:w-1/2 h-40 bg-white/5 rounded-xl border border-white/10 p-4 space-y-3 order-1 md:order-2">
                                <div className="flex gap-2">
                                    <div className="size-6 rounded-full bg-primary/40"></div>
                                    <div className="h-3 w-2/3 bg-white/10 rounded-full"></div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <div className="h-3 w-1/2 bg-primary/40 rounded-full"></div>
                                    <div className="size-6 rounded-full bg-slate-600"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="size-6 rounded-full bg-primary/40"></div>
                                    <div className="h-3 w-3/4 bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 obsidian-gradient -z-20"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent -z-10"></div>
                <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 md:p-20 relative border-white/10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl">
                        <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        Ready to unseal your <br />financial potential?
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                        Join the privacy-first financial revolution today. No credit card required, just your data and your device.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="px-10 py-5 rounded-xl bg-primary text-white font-bold text-lg hover:scale-105 transition-all indigo-glow min-w-[200px]">
                            Start Audit Free
                        </Link>
                        <button className="px-10 py-5 rounded-xl border border-white/20 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all min-w-[200px]">
                            Schedule a Demo
                        </button>
                    </div>
                    <p className="mt-8 text-xs text-slate-500 font-medium uppercase tracking-[0.2em]">
                        Local-first processing · 256-bit Encryption · No Data Mining
                    </p>
                </div>
            </section>

            {/* Footer */}
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
                                The ultimate local AI tool for wealth management. Privacy isn't a feature, it's our core architecture.
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
        </div>
    );
}
