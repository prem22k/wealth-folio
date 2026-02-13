'use client';

import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { Transaction } from '@/types/schema';
import { formatCurrency } from '@/lib/formatters';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ManualEntryModal from './ManualEntryModal';
import UserAvatar from '@/components/ui/UserAvatar';
import DashboardShell from './DashboardShell';
import { clearHistory } from '@/lib/firebase/transactions';
import {
    Home as HomeIcon,
    Activity,
    AlertTriangle,
    Lock as LockIcon,
    Settings as SettingsIcon,
    Utensils,
    Plane,
    Receipt as ReceiptIcon,
    ShoppingBag as ShoppingBagIcon,
    Zap,
    Search,
    Bell,
    ArrowDownLeft,
    ArrowUpRight,
    Trash2
} from 'lucide-react';

interface UnsealStreamProps {
    user: User | null;
    transactions: Transaction[];
}

export default function UnsealStream({ user, transactions }: UnsealStreamProps) {

    // Group transactions by Date
    const groupedTransactions = useMemo(() => {
        const groups: { date: string; label: string; items: Transaction[] }[] = [];

        // Sort desc
        const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        sorted.forEach((tx) => {
            const dateObj = new Date(tx.date);
            const dateStr = format(dateObj, 'yyyy-MM-dd');

            let label = format(dateObj, 'MMMM d');
            if (isToday(dateObj)) label = 'Today';
            if (isYesterday(dateObj)) label = 'Yesterday';

            let group = groups.find(g => g.date === dateStr);
            if (!group) {
                group = { date: dateStr, label, items: [] };
                groups.push(group);
            }
            group.items.push(tx);
        });

        return groups;
    }, [transactions]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const handleClearHistory = async () => {
        if (!user?.uid) return;

        setIsClearing(true);
        try {
            const deletedCount = await clearHistory(user.uid);
            console.log(`Cleared ${deletedCount} transactions`);
            setShowClearDialog(false);
        } catch (error) {
            console.error('Failed to clear history:', error);
            alert('Failed to clear history. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    const searchBar = (
        <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-primary transition-colors h-5 w-5" />
            </div>
            <input className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 sm:text-sm transition-all" placeholder="Search transactions, assets, or tags..." type="text" />
        </div>
    );

    return (
        <DashboardShell headerCenterContent={searchBar} headerTitle="Unseal">

            {/* Quick Add FAB (Mobile/Desktop) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-[60] bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 border border-white/10 flex items-center justify-center"
            >
                <span className="material-symbols-outlined text-2xl">add</span>
            </motion.button>

            <ManualEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Filter Chips - Professional Style */}
            <div className="flex gap-3 pb-8 overflow-x-auto hide-scrollbar sticky top-0 z-40 py-2 -mx-4 px-4 mask-fade-sides bg-[#0B0C10]/95 backdrop-blur-md">
                <button className="h-8 px-4 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 transition-colors">
                    All
                </button>
                {[
                    { label: 'Food', icon: Utensils },
                    { label: 'Travel', icon: Plane },
                    { label: 'Bills', icon: ReceiptIcon },
                    { label: 'Shopping', icon: ShoppingBagIcon },
                    { label: 'Utilities', icon: Zap },
                ].map((chip) => (
                    <button key={chip.label} className="h-8 px-4 rounded-lg flex items-center justify-center shrink-0 group hover:bg-white/5 transition-all border border-white/5 bg-transparent">
                        <chip.icon className="h-3.5 w-3.5 text-zinc-500 mr-2 group-hover:text-zinc-300" />
                        <span className="text-zinc-500 text-xs font-medium group-hover:text-zinc-300">{chip.label}</span>
                    </button>
                ))}

                {/* Clear History Button */}
                <button
                    onClick={() => setShowClearDialog(true)}
                    disabled={transactions.length === 0}
                    className="ml-auto h-8 px-4 rounded-lg flex items-center justify-center shrink-0 group hover:bg-red-500/10 transition-all border border-red-500/20 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-400 mr-2" />
                    <span className="text-red-400 text-xs font-medium">Clear History</span>
                </button>
            </div>

            {/* Clear History Confirmation Dialog */}
            {showClearDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0B0C10] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Trash2 className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Clear Transaction History?</h3>
                                <p className="text-sm text-slate-400">
                                    This will permanently delete all {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} from your history. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearDialog(false)}
                                disabled={isClearing}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearHistory}
                                disabled={isClearing}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isClearing ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Clearing...
                                    </>
                                ) : (
                                    'Clear All'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Timeline Container */}
            <div className="relative mt-8">
                {/* Vertical Timeline Guide - Subtle */}
                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/5"></div>

                {groupedTransactions.map((group, groupIndex) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                        key={group.date}
                        className="relative mb-12"
                    >
                        <div className="flex items-center mb-6 pl-14">
                            <span className="text-white text-sm font-semibold tracking-tight">{group.label}</span>
                            <span className="ml-3 text-[10px] font-mono text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                {format(new Date(group.date), 'MMM dd')}
                            </span>
                        </div>

                        {group.items.map((tx, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                key={tx.id}
                                className="group relative flex items-center gap-6 mb-4"
                            >
                                {/* Timeline Node */}
                                <div className={`absolute left-6 w-3 h-[1px] ${tx.type === 'income' ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}></div>

                                <div className={`z-10 w-12 h-12 rounded-full bg-[#0B0C10] border flex items-center justify-center shrink-0
                                ${tx.type === 'income' ? 'border-emerald-500/20' : 'border-rose-500/20'}
                            `}>
                                    {tx.type === 'income' ? (
                                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                                    )}
                                </div>

                                {/* Card - Minimalist */}
                                <div className="w-full rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                            {/* Category Icon Placeholder */}
                                            <span className="text-[10px] font-bold text-zinc-500">{tx.category ? tx.category.substring(0, 2).toUpperCase() : 'TX'}</span>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <h4 className="text-zinc-200 text-sm font-medium leading-tight max-w-[200px] sm:max-w-md truncate">{tx.description}</h4>
                                            <span className="text-zinc-600 text-xs mt-0.5">
                                                {format(new Date(tx.date), 'h:mm a')} • {tx.category || 'Uncategorized'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Status Pill - optional */}
                                        <div className={`hidden sm:flex items-center gap-2 px-2 py-0.5 rounded border ${tx.status === 'verified' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
                                            <div className={`w-1 h-1 rounded-full ${tx.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className={`text-[9px] font-semibold uppercase tracking-wider ${tx.status === 'verified' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status || 'Pending'}</span>
                                        </div>

                                        <span className={`font-mono font-medium text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-zinc-200'}`}>
                                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ))}
            </div>
        </DashboardShell>
    );
}
