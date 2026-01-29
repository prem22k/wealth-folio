'use client';

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import UnsealVault from "@/components/dashboard/UnsealVault";
import Link from "next/link";
import UnsealDock from "@/components/dashboard/UnsealDock";
import UserAvatar from "@/components/ui/UserAvatar";
import {
    Home as HomeIcon,
    Activity,
    AlertTriangle,
    Lock as LockIcon,
    Settings as SettingsIcon
} from "lucide-react";

export default function VaultPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#020205] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-400 font-medium">Securing Environment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col pb-32 relative font-display bg-[#020205] text-white overflow-x-hidden selection:bg-primary/30">

            {/* Background Base */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1e2e_0%,_#020205_70%)]"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]"></div>
                {/* Noise not available as URL, can simulate later or skip */}
            </div>

            <div className="relative flex min-h-screen w-full flex-col z-10">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020205]/70 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-[20px]">lock_open</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">Unseal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative rounded-full p-2 text-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#020205]"></span>
                            </button>
                            <div className="h-6 w-px bg-white/10"></div>
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Security Analyst</p>
                                </div>
                                <UserAvatar />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
                    <UnsealVault />
                </main>

                {/* Floating Dock Navigation */}
                <UnsealDock activePath="/vault" />
            </div>
        </div>
    );
}
