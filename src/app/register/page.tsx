'use client';

import Link from 'next/link';

export default function Register() {
    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-[#020205] text-white selection:bg-primary/30 font-display">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]"></div>
            </div>

            <div className="relative z-20 w-full max-w-lg p-4">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white mb-6 transition-colors group">
                    <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Back to Login
                </Link>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* "Closed" Overlay - Premium Touch */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4">
                                Invite Only
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Request Access</h1>
                            <p className="text-slate-400">
                                Unseal is currently in private beta. High-net-worth individuals may apply for early access.
                            </p>
                        </div>

                        <form className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" placeholder="John" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" placeholder="john@company.com" />
                            </div>

                            <button type="button" className="mt-2 w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                                Join Waitlist
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">
                    Already have an invite code? <span className="text-white underline cursor-pointer">Unseal here.</span>
                </p>
            </div>
        </div>
    );
}
