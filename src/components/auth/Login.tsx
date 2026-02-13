'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { UnsealLogo } from '@/components/ui/UnsealLogo';

export default function Login() {
    const { signInWithGoogle, loading } = useAuth();

    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30">
            {/* Left Side: Branding/Visuals */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 mesh-gradient overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 flex items-center gap-2 opacity-80">
                    <div className="size-6 text-primary">
                        <UnsealLogo />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Unseal</span>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8 shield-glow">
                        <span className="material-symbols-outlined !text-[120px] text-primary select-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>
                            shield_with_heart
                        </span>
                    </div>
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] max-w-md">
                        End-to-End Encrypted Session
                    </h1>
                    <p className="mt-4 text-slate-400 text-lg max-w-sm">
                        Your data is locked with industry-standard AES-256 encryption before it ever leaves your device.
                    </p>
                </div>
                {/* Testimonial Glass Card */}
                <div className="absolute bottom-12 left-12 right-12 max-w-md">
                    <div className="glass-panel p-6 rounded-xl flex flex-col gap-3">
                        <div className="flex gap-1 text-primary">
                            <span className="material-symbols-outlined !text-sm">star</span>
                            <span className="material-symbols-outlined !text-sm">star</span>
                            <span className="material-symbols-outlined !text-sm">star</span>
                            <span className="material-symbols-outlined !text-sm">star</span>
                            <span className="material-symbols-outlined !text-sm">star</span>
                        </div>
                        <p className="text-white/90 italic font-medium leading-relaxed">
                            "Finally, a dashboard that respects my data privacy. The security protocols are unmatched in the industry."
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                <span className="material-symbols-outlined !text-xs text-primary">verified_user</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Alex Rivers</p>
                                <p className="text-xs text-slate-400">Security Engineer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-[440px] flex flex-col gap-8">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-4 self-center">
                        <div className="size-6 text-primary">
                            <UnsealLogo />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Unseal</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back to Unseal.</h2>
                        <p className="text-slate-400 text-sm">Enter your credentials to access your vault.</p>
                    </div>
                    <form className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="glass-input flex items-center rounded-lg px-4 focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="material-symbols-outlined text-slate-500 !text-xl">mail</span>
                                <input className="bg-transparent border-none w-full h-12 text-white placeholder:text-slate-500 focus:ring-0 text-base" placeholder="name@company.com" type="email" />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <Link href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot Password?</Link>
                            </div>
                            <div className="glass-input flex items-center rounded-lg px-4 focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="material-symbols-outlined text-slate-500 !text-xl">lock</span>
                                <input className="bg-transparent border-none w-full h-12 text-white placeholder:text-slate-500 focus:ring-0 text-base" placeholder="••••••••" type="password" />
                                <button className="text-slate-500 hover:text-slate-300" type="button">
                                    <span className="material-symbols-outlined !text-xl">visibility_off</span>
                                </button>
                            </div>
                        </div>
                        {/* Primary CTA */}
                        <button type="button" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg mt-2 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span>Access Vault</span>
                            <span className="material-symbols-outlined !text-lg">arrow_forward</span>
                        </button>
                        {/* Divider */}
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Or continue with</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                        {/* Social Login */}
                        <button
                            type="button"
                            onClick={signInWithGoogle}
                            disabled={loading}
                            className="w-full bg-white text-slate-900 font-bold h-12 rounded-lg flex items-center justify-center gap-3 transition-colors hover:bg-slate-100 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    <span>Sign in with Google</span>
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account?
                            <Link className="text-primary font-bold hover:underline ml-1" href="/register">Register</Link>
                        </p>
                    </div>
                    {/* Subtle Trust Footer */}
                    <div className="mt-auto flex justify-center items-center gap-6 pt-10 text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-xs">verified</span> SOC2 Compliant</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-xs">lock</span> GDPR Ready</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-xs">security</span> 256-bit AES</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
