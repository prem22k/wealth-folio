'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Home as HomeIcon,
    Activity,
    AlertTriangle,
    Lock as LockIcon,
    Settings as SettingsIcon
} from 'lucide-react';

interface UnsealDockProps {
    activePath?: '/' | '/stream' | '/threats' | '/vault' | 'settings';
}

export default function UnsealDock({ activePath = '/' }: UnsealDockProps) {
    const { user } = useAuth();

    // If no user, we might want to hide some sensitive tabs or show a login prompt?
    // For now, based on requirements, we just render the dock. Access control is at page level.

    const getLinkClasses = (path: string) => {
        const isActive = activePath === path;

        // Base classes
        let classes = "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all group ";

        if (isActive) {
            // Active Style (varies slightly by design, but generally primary/glow)
            if (path === '/threats') {
                return "relative flex flex-col items-center justify-center w-16 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]";
            }
            if (path === '/vault') {
                return "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-indigo-400 ring-1 ring-primary/40 shadow-[0_0_20px_rgba(79,70,229,0.4)]";
            }
            // Default Active (Home/Stream)
            return "relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-[0_0_20px_rgba(54,35,225,0.5)] border border-white/20 hover:-translate-y-1 transform";
        }

        // Inactive Style
        return classes + "text-slate-500 hover:text-white hover:bg-white/5";
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className={`flex items-center gap-2 p-2 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black ${activePath === '/' ? 'rounded-full px-6 py-3' : ''}`}> {/* Dashboard had different wrapper style, harmonizing to 'glass-panel floating' style */}

                {/* Home */}
                <Link href="/" className={activePath === '/' ? "relative group p-3 rounded-xl transition-all hover:scale-110" : getLinkClasses('/')}>
                    {activePath === '/' ? (
                        <>
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md nav-glow-active"></div>
                            <div className="relative z-10 text-white flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined fill-current">home</span>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1 group">
                            {/* Use Lucide for consistency across new components, or Material for Home if sticking to Dash design */}
                            {/* Standardizing on Lucide for the Dock component to be safe */}
                            <HomeIcon className="h-6 w-6 mb-0.5" />
                            <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">Home</span>
                        </div>
                    )}
                </Link>

                {/* Stream */}
                <Link href="/stream" className={getLinkClasses('/stream')}>
                    <Activity className={`h-6 w-6 ${activePath === '/stream' ? 'z-10' : 'mb-0.5'}`} />
                    {activePath === '/stream' ? (
                        <span className="absolute inset-0 rounded-full bg-primary animate-pulse opacity-50"></span>
                    ) : (
                        <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">Stream</span>
                    )}
                </Link>

                {/* Threats */}
                <Link href="/threats" className={getLinkClasses('/threats')}>
                    {activePath === '/threats' ? (
                        <>
                            <Activity className="h-7 w-7 mb-0.5" />
                            <span className="text-[10px] font-bold">Threats</span>
                            {/* Live Indicator */}
                            <span className="absolute top-2 right-3 w-2 h-2 bg-red-600 rounded-full border border-black"></span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-6 w-6 mb-0.5" />
                            <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">Audit</span>
                        </>
                    )}
                </Link>

                {/* Vault */}
                <Link href="/vault" className={getLinkClasses('/vault')}>
                    <LockIcon className={`h-6 w-6 ${activePath === '/vault' ? '' : 'mb-0.5'}`} />
                    {activePath === '/vault' && (
                        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-400 shadow-[0_0_5px_#818cf8]"></span>
                    )}
                    {activePath !== '/vault' && (
                        <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">Vault</span>
                    )}
                </Link>

                {/* Divider */}
                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* Settings (Placeholder) */}
                <button className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group">
                    <SettingsIcon className="h-6 w-6 mb-0.5" />
                    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1 transition-opacity">Settings</span>
                </button>
            </div>
        </div>
    );
}
