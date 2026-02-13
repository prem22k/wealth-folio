'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import VampireViz from '@/components/auth/VampireViz';

export default function Register() {
    const { signInWithGoogle, loading } = useAuth();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-hidden min-h-screen flex w-full flex-row">
            {/* Left Side: Visual/Hero Section */}
            <div className="hidden lg:flex flex-1 relative mesh-gradient items-center justify-center p-20 overflow-hidden border-r border-white/5">
                <div className="z-10 flex flex-col items-start gap-8 max-w-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-8 text-primary">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tighter">UNSEAL</span>
                    </div>
                    <div className="runway-graphic flex items-center justify-center w-full h-[300px] relative">
                        <VampireViz />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                            Stop the bleed.
                        </h1>
                        <p className="text-slate-300 text-lg font-normal leading-relaxed max-w-md">
                            Find out your true financial runway in 30 seconds with our Vampire Cost Detector.
                        </p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex -space-x-2">
                            {/* Avatars - Using colors/initials since I don't have the explicit URLs or want to rely on external images if possible, 
                                 BUT the user provided URLs. I will use them but maybe fallback or local if needed. 
                                 For now, using the provided URLs is fine as they are likely placeholders or public assets. 
                                 Actually, let's use the provided Google URLs, they seem public. 
                             */}
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 bg-cover" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuD7E0dYTUXUszOyQtpi0doc8zLGvzluwbpaVhJnJHVglF0-jogROi--OGDrI2I_bz88yUiru97D2ezO8tA0lnJ4OYANvkMXJYYAaDI0FHYBa8MMaBc1XKK8nMkW3OVWBpoD6ljp4NVUxe7I0Yc9Vas9l5iamhpI-qscpHQGrfJO22FRcMlu7dj7KMLv9dY-Ki-Is1OA-uqii6UT1aucr_qHwRwhjjm50eg3JbitnChQ9Di2-UsH5hMGa85K5VLHinZvjUEyWF3C6Q)' }}></div>
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 bg-cover" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuANXb80sbyvl572fxGHAhrivPZprV1uhc7b9a0rcG4y2fNOuU_1C4vJvHMc0kuu5ZbZwUeu_R-GV5k1IjEDuJV4ZvjAVMBr2KjRe87xr8zaXnveqx-Z5wUfS9FbTtDd3pEpMzZZWKtoXmD-8f00e6b_KrquX3EdKPxH6r61GINDq4EvsQqy69GYXcRXCxN2h7C29hSPUP4gJyoGCKhrG2iuoJRvqkVyFrzqxuF-R5cnX-5fsZyGXsrGh5DEjrl4rIoWJqOeTvO53Q)' }}></div>
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 bg-cover" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuABYgIBKD-aoJfm4w7VuhhfT0svFbvEBTRrfYqwjv6_E7SwjRp2GJ7XyA18VDuwlorw3k_nJK1gP7TGfaT2jWCoboQ2vTMWdb059dUbF3JPNS9q_KxYCbQdq_TBwt2GGQuofMy3XJT42xwlzss-sbwE3UWi1L1s-pEX8gZ7iVXJjO6YqQA9ZPyfjEXq2sn2pQZDOsb558-Awt09foblquNvq9RZ_q2QKBoEWG0q75raG8dNimRtjdbQ9em-EEKW3AoKPcPSRO8IlA)' }}></div>
                        </div>
                        <p className="text-sm text-slate-400"><span className="text-white font-semibold">500+</span> Founders auditing today</p>
                    </div>
                </div>
                {/* Background Decorative Element */}
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
            </div>

            {/* Right Side: Registration Form */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative dark:bg-[#0a0a1a]">
                <div className="w-full max-w-[440px] glass-panel p-8 sm:p-10 rounded-xl shadow-2xl">
                    <header className="mb-8">
                        <h2 className="text-white text-3xl font-bold leading-tight tracking-tight mb-2">Initialize your Audit</h2>
                        <p className="text-slate-400 text-sm font-normal">Enter your details to create a secure account and begin your financial scan.</p>
                    </header>
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1.5">
                            <label className="text-white text-xs font-bold uppercase tracking-wider pl-1">Full Name</label>
                            <input className="glass-input flex w-full rounded-lg text-white h-12 placeholder:text-slate-500 px-4 text-base font-normal" placeholder="Johnathan Doe" type="text" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-white text-xs font-bold uppercase tracking-wider pl-1">Email Address</label>
                            <input className="glass-input flex w-full rounded-lg text-white h-12 placeholder:text-slate-500 px-4 text-base font-normal" placeholder="john@company.io" type="email" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-white text-xs font-bold uppercase tracking-wider pl-1">Password</label>
                                <input className="glass-input flex w-full rounded-lg text-white h-12 placeholder:text-slate-500 px-4 text-base font-normal" placeholder="••••••••" type="password" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-white text-xs font-bold uppercase tracking-wider pl-1">Confirm</label>
                                <input className="glass-input flex w-full rounded-lg text-white h-12 placeholder:text-slate-500 px-4 text-base font-normal" placeholder="••••••••" type="password" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button className="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal transition-all shadow-[0_0_20px_rgba(43,43,238,0.3)]" type="button">
                                <span className="truncate">Create Secure Account</span>
                            </button>
                        </div>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                        <button
                            onClick={signInWithGoogle}
                            disabled={loading}
                            className="w-full flex cursor-pointer items-center justify-center gap-3 rounded-lg h-12 px-6 glass-input text-white text-sm font-semibold leading-normal hover:bg-white/10 transition-colors disabled:opacity-50"
                            type="button"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    <span>Sign up with Google</span>
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4 py-3 px-4 rounded-lg bg-white/5 border border-white/5 w-full justify-center">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Bank-grade Encryption</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10"></div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">No PII Storage</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">
                            Already have an account?
                            <Link className="text-primary font-bold hover:underline ml-1" href="/login">Login</Link>
                        </p>
                    </div>
                </div>
                {/* Footer Small */}
                <div className="absolute bottom-8 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                    © 2024 Unseal Intelligence. All rights reserved.
                </div>
            </main>
        </div>
    );
}
