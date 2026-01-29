'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Login() {
    const { signInWithGoogle, loading } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-[#020205] text-white selection:bg-primary/30 font-display">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020205_100%)] z-10"></div>
            </div>

            <div className="relative z-20 w-full max-w-md p-1">
                {/* Glass Card */}
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden group">

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Content */}
                    <div className="flex flex-col items-center text-center">
                        {/* Logo / Icon */}
                        <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/25 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-white text-[28px]">lock_open</span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight mb-2">Unseal</h1>
                        <p className="text-slate-400 text-sm mb-8 max-w-[250px]">
                            Secure wealth intelligence for the modern CFO.
                        </p>

                        {/* Sign In Button */}
                        <button
                            onClick={signInWithGoogle}
                            disabled={loading}
                            className="w-full relative group/btn flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        <div className="mt-8 pt-6 border-t border-white/5 w-full flex justify-center gap-6 text-xs text-slate-500 font-mono uppercase tracking-widest">
                            <Link href="/register" className="hover:text-white transition-colors">Apply for Access</Link>
                            <span>•</span>
                            <span className="cursor-help hover:text-white transition-colors">Manifesto</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-6 font-mono">
                    ENCRYPTED // ZERO-KNOWLEDGE // PRE-SEED
                </p>
            </div>
        </div>
    );
}
