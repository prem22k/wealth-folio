'use client';

import React from 'react';

export default function FeaturesSection() {
    return (
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
    );
}
