'use client';

import React, { useMemo } from 'react';
import { User } from 'firebase/auth';
import { Transaction } from '@/types/schema';
import { format, subMonths, isSameMonth } from 'date-fns';
import DashboardShell from './DashboardShell';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface UnsealDashboardProps {
    user: User | null;
    balance: number;
    transactions: Transaction[];
    stats: {
        income: number;
        expense: number;
    };
}

export default function UnsealDashboard({ user, balance, transactions, stats }: UnsealDashboardProps) {
    const firstName = user?.displayName?.split(' ')[0] || 'User';
    const recentTx = transactions.slice(0, 5);

    // Calculate Real Monthly Burn (Average of last 3 months or all available)
    const monthlyBurn = useMemo(() => {
        if (transactions.length === 0) return 0;

        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return 0;

        // Group by month
        const expensesByMonth: Record<string, number> = {};
        expenses.forEach(t => {
            const monthKey = format(new Date(t.date), 'yyyy-MM');
            expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + t.amount;
        });

        const months = Object.keys(expensesByMonth);
        if (months.length === 0) return 0;

        // Calculate average
        const totalExpenses = Object.values(expensesByMonth).reduce((sum, val) => sum + val, 0);
        const avgBurnPaise = totalExpenses / months.length;

        return avgBurnPaise; // Keep in paise for formatCurrency if needed, but runway calc needs consistent units
    }, [transactions]);

    const runwayMonths = useMemo(() => {
        if (monthlyBurn === 0) return '∞';
        const balancePaise = balance;
        return (balancePaise / monthlyBurn).toFixed(1);
    }, [balance, monthlyBurn]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Calculate Chart Data from Real Transactions
    const chartData = useMemo(() => {
        let currentBal = balance / 100; // Convert paise to rupees
        const months = [];

        // Generate last 6 months dates (current to past)
        for (let i = 0; i < 6; i++) {
            months.push(subMonths(new Date(), i));
        }

        const history = [];

        // Iterate backwards (Current -> Past) to calculate opening balances
        for (const date of months) {
            // Push current state for this month
            history.unshift({
                name: format(date, 'MMM'),
                value: Math.max(0, currentBal) // Ensure no negative balance in chart for visual sanity? Or allow it.
            });

            // Calculate Net Change for this month to find PREVIOUS month's closing balance
            const monthlyTxs = transactions.filter(t => isSameMonth(new Date(t.date), date));
            const income = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const netChange = (income - expense) / 100;

            // Previous Month Closing = Current Month Closing - Net Change
            // (e.g. If I have 100 now, and I earned 10 net this month, I started with 90)
            currentBal -= netChange;
        }

        return history;
    }, [balance, transactions]);

    return (
        <DashboardShell showSecureBadge={true}>
            <div className="w-full flex flex-col gap-6">

                {/* Welcome Card with Breathing Glow */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group rounded-2xl p-[1px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 bg-[length:200%_auto] animate-shimmer"
                >
                    <div className="bg-[#0B0C10] rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                        <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight relative z-10">
                            {greeting}, {firstName}. <br />
                            <span className="text-zinc-500 font-normal">Your financial fortress is active.</span>
                        </h1>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Financial Runway (Gauge) - Span 4 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 glass-panel rounded-2xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[320px]"
                    >
                        <div className="w-full flex justify-start">
                            <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Financial Runway</h3>
                        </div>
                        {/* Gauge */}
                        <div className="relative flex items-center justify-center size-56 my-4">
                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="none" r="45" stroke="#1e293b" strokeWidth="6"></circle>
                                <motion.circle
                                    cx="50" cy="50" fill="none" r="45"
                                    stroke="url(#runwayGradient)"
                                    strokeDasharray="283"
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{ strokeDashoffset: 283 - (Math.min(Number(runwayMonths), 12) / 12 * 283) }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.3 }}
                                    strokeLinecap="round"
                                    strokeWidth="6"
                                    className="drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                ></motion.circle>
                                <defs>
                                    <linearGradient id="runwayGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                                        <stop offset="0%" stopColor="#4f46e5"></stop>
                                        <stop offset="100%" stopColor="#818cf8"></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-5xl font-bold text-white tracking-tighter"
                                >
                                    {runwayMonths}
                                </motion.span>
                                <span className="text-xs text-zinc-500 font-medium mt-1">Months</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5 w-full">
                            <p className="text-zinc-400 text-xs font-medium">
                                {monthlyBurn > 0
                                    ? `Based on ${formatCurrency(monthlyBurn)} avg monthly costs`
                                    : 'No monthly burn detected'
                                }
                            </p>
                        </div>
                    </motion.div>

                    {/* CFO Intelligence - Span 8 */}
                    <div className="lg:col-span-8 glass-panel rounded-2xl relative min-h-[320px] flex flex-col items-center justify-center p-8 overflow-hidden group">
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent z-20">
                            <div className="absolute inset-0 rounded-2xl border border-white/5"></div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6 items-center text-center">
                            <div className="space-y-2 flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/10 mb-2">
                                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                                    <span>CFO Intelligence</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">Ask your personal CFO</h3>
                                <p className="text-zinc-400 max-w-md mx-auto">Get instant insights on your spending, investments, and wealth leaks.</p>
                            </div>
                            <div className="w-full relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl opacity-20 blur group-hover/input:opacity-50 transition duration-500"></div>
                                <div className="relative flex items-center bg-[#0a0a12] rounded-xl px-4 py-4 border border-white/10 shadow-xl">
                                    <span className="material-symbols-outlined text-zinc-500 mr-3">colors_spark</span>
                                    <input
                                        className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-zinc-600 text-sm md:text-base p-0"
                                        placeholder="Ask your CFO (e.g., How much did I spend on Swiggy?)"
                                        type="text"
                                    />
                                    <button className="ml-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Wealth Stream (Recharts) - Span 12 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-12 glass-panel rounded-2xl min-h-[400px] relative p-8 flex flex-col overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-6">
                            <div>
                                <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Net Wealth Stream</h3>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
                                        ₹{(balance / 100).toLocaleString('en-IN')}
                                    </h2>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                                        <span className="material-symbols-outlined text-emerald-400 text-[16px]">trending_up</span>
                                        <span className="text-emerald-400 text-sm font-bold">+8.4%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#52525b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide={true}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Recent Activity - Span 12 */}
                    <div className="lg:col-span-12 glass-panel rounded-2xl p-8">
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentTx.length === 0 ? (
                                <p className="text-slate-500 text-sm">No recent activity.</p>
                            ) : (
                                recentTx.map((tx, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        key={tx.id || Math.random()}
                                        className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                                                {tx.type === 'income' ? (
                                                    <span className="material-symbols-outlined text-emerald-400 text-[20px] group-hover:text-emerald-300">arrow_downward</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-white">swap_horiz</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{tx.description}</p>
                                                <p className="text-slate-500 text-xs">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                                            </div>
                                        </div>
                                        <span className={`font-medium text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                            {tx.type === 'income' ? '+' : '-'}₹{(tx.amount / 100).toLocaleString('en-IN')}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
