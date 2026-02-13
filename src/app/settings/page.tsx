'use client';

import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Download, Moon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <DashboardShell headerTitle="Config">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-white text-3xl font-bold leading-tight">System Configuration</h1>
                    <p className="text-slate-400">Manage your data sovereignty.</p>
                </div>

                {/* Data Export */}
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/5">
                            <Download className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Export Ledger</h3>
                            <p className="text-slate-400 text-sm">Download full transaction history (JSON/CSV).</p>
                        </div>
                    </div>
                    <button className="px-6 py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors">
                        Export
                    </button>
                </div>

                {/* Appearance */}
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between opacity-50 pointer-events-none">
                    <div className="flex gap-4 items-center">
                        <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/5">
                            <Moon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Theme</h3>
                            <p className="text-slate-400 text-sm">Unseal is locked to Obsidian Mode.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
