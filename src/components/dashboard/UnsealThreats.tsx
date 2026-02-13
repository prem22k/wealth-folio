'use client';

import React, { useMemo } from 'react';
import { User } from 'firebase/auth';
import { Transaction } from '@/types/schema';
import { Subscription } from '@/lib/analysis/subscription-engine';
import { Anomaly } from '@/lib/analysis/anomaly-engine';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';
import UnsealDock from './UnsealDock';
import UserAvatar from '@/components/ui/UserAvatar';
import {
    ShieldAlert, AlertTriangle, Power,
    Copy, TrendingUp, Zap
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface UnsealThreatsProps {
    user: User | null;
    subscriptions: Subscription[];
    anomalies: Anomaly[];
}

export default function UnsealThreats({ user, subscriptions, anomalies }: UnsealThreatsProps) {

    // Calculate Total Monthly Bleed
    // Assuming subscription.averageAmount is in paise approx per month
    const totalMonthlyBleed = useMemo(() => {
        return subscriptions.reduce((acc, sub) => acc + sub.averageAmount, 0);
    }, [subscriptions]);

    // Calculate Radar Data from Real Subscriptions
    const radarData = useMemo(() => {
        if (!subscriptions || subscriptions.length === 0) {
            return [
                { subject: 'SaaS', A: 0, fullMark: 100 },
                { subject: 'Media', A: 0, fullMark: 100 },
                { subject: 'Util', A: 0, fullMark: 100 },
                { subject: 'Health', A: 0, fullMark: 100 },
                { subject: 'Food', A: 0, fullMark: 100 },
                { subject: 'Other', A: 0, fullMark: 100 },
            ];
        }

        const categoryMap: Record<string, number> = {};
        subscriptions.forEach(sub => {
            const cat = sub.category || 'Uncategorized';
            // Take first word and ensure it's short for the chart label
            const key = cat.split(' ')[0].substring(0, 10);
            categoryMap[key] = (categoryMap[key] || 0) + sub.averageAmount;
        });

        let data = Object.keys(categoryMap).map(key => ({
            subject: key,
            A: categoryMap[key] / 100, // Convert to Rupees
            fullMark: 0
        }));

        // Sort by spend (descending) to highlight biggest threats
        data.sort((a, b) => b.A - a.A);

        // Take top 6 categories
        if (data.length > 6) data = data.slice(0, 6);

        // Pad with placeholders if less than 3 categories (needed for Radar shape)
        const placeholders = [' void ', ' ... ', ' - '];
        let pIdx = 0;
        while (data.length < 3) {
            data.push({ subject: placeholders[pIdx++] || '...', A: 0, fullMark: 0 });
        }

        // Determine max scale
        const maxVal = Math.max(...data.map(d => d.A));
        const limit = Math.max(maxVal * 1.2, 500); // Min scale 500

        return data.map(d => ({ ...d, fullMark: limit }));
    }, [subscriptions]);

    return (
        <div className="min-h-screen w-full flex flex-col pb-32 relative font-display bg-[#050505] text-slate-200 overflow-x-hidden selection:bg-red-500/30 selection:text-white">
            {/* Background Gradient Base via Tailwind Config Custom Class equivalent */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#020617_60%,_#000000_100%)] pointer-events-none"></div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Navigation */}
                <header className="flex items-center justify-between py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-white">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <h2 className="text-white text-lg font-bold tracking-tight">Unseal <span className="text-slate-500 font-normal">/ Audit</span></h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/40 border border-white/10 text-xs font-medium text-slate-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Monitoring
                        </div>
                        <UserAvatar />
                    </div>
                </header>

                {/* Hero Metric Section */}
                <div className="mt-12 mb-10 text-center flex flex-col items-center animate-in slide-in-from-bottom-5 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/20 border border-red-900/30 text-red-500 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <AlertTriangle className="h-3 w-3" />
                        {subscriptions.length > 0 ? 'Critical Leak Detected' : 'System Secure'}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
                        <div>
                            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-white mb-2">
                                <span className="text-red-500">{formatCurrency(totalMonthlyBleed)}</span>
                            </h1>
                            <p className="text-xl text-zinc-400 font-medium tracking-tight">Total Monthly Bleed</p>
                            <p className="text-zinc-600 text-sm mt-1">Recurring fixed costs detected across {subscriptions.length} active vectors</p>
                        </div>

                        {/* Radar View */}
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Spend"
                                        dataKey="A"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fill="#ef4444"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Subscription Threats List */}
                <div className="flex flex-col gap-4 mb-12">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Active Vectors</h3>
                        <span className="text-xs text-zinc-600">Sorted by impact</span>
                    </div>

                    {subscriptions.length === 0 ? (
                        <div className="text-center p-8 rounded-lg border border-white/5 bg-white/5 text-zinc-400 text-sm">
                            No active subscriptions detected. You are clean.
                        </div>
                    ) : (
                        subscriptions.map((sub, idx) => (
                            <div key={idx} className="group relative flex items-center justify-between p-0 rounded-xl bg-[#0B0C10] border border-white/5 hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center flex-1 p-5 gap-5">
                                    <div className="h-10 w-10 rounded-lg bg-white/5 p-1 flex items-center justify-center shrink-0 border border-white/5">
                                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-zinc-400 uppercase">
                                            {sub.vendorName.substring(0, 3)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-zinc-200 font-semibold text-base leading-tight group-hover:text-white transition-colors capitalize">{sub.vendorName}</h4>
                                        <p className="text-zinc-500 text-xs mt-0.5">Recurring Detection ({Math.round(sub.confidence * 100)}%)</p>
                                    </div>
                                </div>
                                {/* Divider */}
                                <div className="h-10 w-px bg-white/5 mx-2 hidden sm:block"></div>
                                <div className="flex items-center gap-8 p-5">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-white font-mono font-medium text-base">{formatCurrency(sub.averageAmount)}</p>
                                        <p className="text-zinc-600 text-[10px] uppercase tracking-wider">Monthly</p>
                                    </div>
                                    <button className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
                                        <Power className="h-3.5 w-3.5 group-hover/btn:animate-pulse" />
                                        <span className="text-xs font-bold">Kill</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Anomalies Section */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm mb-32">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Zap className="text-red-600 h-6 w-6" />
                            <h3 className="text-white text-lg font-bold">Anomalies Detected</h3>
                        </div>
                        <button className="text-xs text-red-500 font-bold uppercase tracking-wider hover:text-white transition-colors">Scan Now</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {anomalies.length === 0 ? (
                            <p className="text-slate-500 text-sm col-span-2">No anomalies detected in recent activity.</p>
                        ) : (
                            anomalies.map((anomaly) => (
                                <div
                                    key={anomaly.id}
                                    className={`flex flex-col p-4 rounded-lg border transition-colors
                                    ${anomaly.type === 'duplicate'
                                            ? 'bg-red-950/10 border-red-900/30 hover:bg-red-950/20'
                                            : 'bg-amber-950/10 border-amber-900/30 hover:bg-amber-950/20'}
                                `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {anomaly.type === 'duplicate' ? (
                                                <Copy className="h-5 w-5 text-red-600" />
                                            ) : (
                                                <TrendingUp className="h-5 w-5 text-amber-500" />
                                            )}
                                            <span className="text-white font-bold">{anomaly.title}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{new Date(anomaly.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-3">{anomaly.description}</p>
                                    <div className={`mt-auto pt-2 border-t flex justify-between items-center 
                                    ${anomaly.type === 'duplicate' ? 'border-red-900/20' : 'border-amber-900/20'}
                                `}>
                                        <span className="text-slate-300 font-mono text-sm">
                                            {formatCurrency(anomaly.amount)}
                                            {anomaly.type === 'duplicate' && ' x 2'}
                                        </span>
                                        <span
                                            className={`text-xs font-bold cursor-pointer hover:underline 
                                            ${anomaly.type === 'duplicate' ? 'text-red-600' : 'text-amber-500'}
                                        `}
                                        >
                                            Resolve
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
