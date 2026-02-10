'use client';

import React from 'react';
import Link from 'next/link';

export default function CTASection() {
    return (
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
    );
}
