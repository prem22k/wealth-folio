"use client";

import { useMemo } from "react";
import { Transaction } from "@/types/schema";
import { detectSubscriptions } from "@/lib/analysis/subscription-engine";
import { Repeat, Zap, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { toRupees } from "@/types/schema";

interface SubscriptionMonitorProps {
    transactions: Transaction[];
    currentBalance: number; // in paise
}

export default function SubscriptionMonitor({ transactions, currentBalance }: SubscriptionMonitorProps) {

    // 1. Detect Subscriptions via Engine
    const subscriptions = useMemo(() => {
        return detectSubscriptions(transactions);
    }, [transactions]);

    // 2. Kill Feature: Runway Calculation
    const { totalMonthlyFixedCost, runwayMonths, runwayStatus } = useMemo(() => {
        const totalFixed = subscriptions.reduce((acc, sub) => acc + sub.averageAmount, 0);

        // Avoid division by zero
        const months = totalFixed > 0 ? currentBalance / totalFixed : Infinity;

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (months < 3) status = 'critical';
        else if (months < 6) status = 'warning';

        return {
            totalMonthlyFixedCost: totalFixed,
            runwayMonths: months === Infinity ? 999 : months,
            runwayStatus: status
        };
    }, [subscriptions, currentBalance]);

    const formatCurrency = (amountPaise: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amountPaise / 100);
    };

    return (
        <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Repeat className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Recurring</h2>
                        <p className="text-sm text-zinc-400">Subscription Intelligence</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* 1. The Killer Feature: Runway Metric */}
                <div className={`relative p-6 rounded-2xl border overflow-hidden ${runwayStatus === 'critical' ? 'bg-red-900/10 border-red-900/30' :
                        runwayStatus === 'warning' ? 'bg-amber-900/10 border-amber-900/30' :
                            'bg-emerald-900/10 border-emerald-900/30'
                    }`}>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                                <Zap size={14} className={
                                    runwayStatus === 'critical' ? 'text-red-400' :
                                        runwayStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                                } />
                                Financial Runway
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <h3 className={`text-4xl font-bold tracking-tight ${runwayStatus === 'critical' ? 'text-red-400' :
                                        runwayStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                    {runwayMonths === 999 ? '∞' : runwayMonths.toFixed(1)}
                                </h3>
                                <span className="text-zinc-500 font-medium">Months</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-zinc-400 text-xs mb-1">Monthly Fixed Costs</div>
                            <div className="text-xl font-semibold text-white">
                                {formatCurrency(totalMonthlyFixedCost)}
                            </div>
                            <div className="text-xs text-zinc-600 mt-1">
                                {subscriptions.length} active subscriptions
                            </div>
                        </div>
                    </div>

                    {/* Background Glow */}
                    <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${runwayStatus === 'critical' ? 'bg-red-500' :
                            runwayStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                </div>

                {/* 2. Detected Subscription List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Active Subscriptions
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                        {subscriptions.map((sub, idx) => (
                            <div key={`${sub.vendorName}-${idx}`}
                                className="group flex items-center justify-between p-4 bg-zinc-950/50 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700 rounded-2xl transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm uppercase">
                                        {sub.vendorName.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="text-zinc-200 font-medium capitalize">
                                            {sub.vendorName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {sub.frequency}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                Next: {format(new Date(sub.nextExpectedDate), 'MMM dd')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-white font-mono font-medium">
                                        {formatCurrency(sub.averageAmount)}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 mt-1 flex items-center justify-end gap-1">
                                        {(sub.confidence * 100).toFixed(0)}% confidence
                                    </div>
                                </div>
                            </div>
                        ))}

                        {subscriptions.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                                <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
                                <p className="text-zinc-500 text-sm">No recurring subscriptions detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
