'use client';

import React, { useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import {
    calculateCategorySpend,
    calculateCashFlowVelocity,
    formatRupeesCompact,
} from '@/lib/analysis/analytics';
import { Loader2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#64748b'];

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const { transactions, loading: txLoading } = useTransactions(user?.uid);

    const loading = authLoading || txLoading;

    // Inner pie: last 30 days expense by category
    const data01 = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        return calculateCategorySpend(transactions, 30);
    }, [transactions]);

    // Outer ring: last 90 days expense by category
    const data02 = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        return calculateCategorySpend(transactions, 90);
    }, [transactions]);

    // Cash flow: last 6 calendar months income vs expense
    const barData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        return calculateCashFlowVelocity(transactions);
    }, [transactions]);

    if (loading) {
        return (
            <DashboardShell headerTitle="Analytics">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-slate-400 font-medium">Compiling visual intelligence...</p>
                </div>
            </DashboardShell>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <DashboardShell headerTitle="Analytics">
                <div className="flex flex-col gap-8 w-full">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-white text-3xl font-bold leading-tight">Visual Intelligence</h1>
                        <p className="text-slate-400">Deep dive into your financial entropy.</p>
                    </div>

                    <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-3 min-h-[400px]">
                        <div className="p-3 bg-white/5 rounded-full border border-white/5 text-slate-400">
                            <span className="material-symbols-outlined !text-3xl">analytics</span>
                        </div>
                        <h3 className="text-white font-bold text-lg">No Financial Data</h3>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Add or import transactions to see analytics.
                        </p>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell headerTitle="Analytics">
            <div className="flex flex-col gap-8 w-full">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-white text-3xl font-bold leading-tight">Visual Intelligence</h1>
                    <p className="text-slate-400">Deep dive into your financial entropy.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sunburst / Donut Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold">Spend Composition</h3>
                            <span className="text-xs text-slate-500 font-mono">Inner: 30d • Outer: 90d</span>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            {data01.length === 0 && data02.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    No expense records found in the last 90 days.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        {data01.length > 0 && (
                                            <Pie
                                                data={data01}
                                                dataKey="value"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={60}
                                                fill="#4f46e5"
                                                stroke="#1e293b"
                                            />
                                        )}
                                        {data02.length > 0 && (
                                            <Pie
                                                data={data02}
                                                dataKey="value"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                fill="#818cf8"
                                                label={({ name, value }: any) => `${name} (${formatRupeesCompact(value)})`}
                                                stroke="#1e293b"
                                            >
                                                {data02.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        )}
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col"
                    >
                        <h3 className="text-white font-bold mb-4">Cash Flow Velocity</h3>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                        formatter={(val: any, name: any) => [
                                            `₹${Number(val).toLocaleString('en-IN')}`,
                                            name === 'income' ? 'Income' : 'Expense',
                                        ]}
                                    />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardShell>
    );
}
