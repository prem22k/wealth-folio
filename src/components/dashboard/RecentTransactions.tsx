"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Transaction } from "@/types/schema";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Trash2 } from "lucide-react";
import { deleteTransaction, clearHistory } from "@/lib/firebase/transactions";

export default function RecentTransactions({ transactions, userId }: { transactions: Transaction[], userId: string }) {

    // Group transactions by Date (The "Navi" Feature)
    const grouped = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        // Sort transactions by date desc first to ensure groups are ordered
        const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        sorted.forEach((t) => {
            // Create a key like "2025-12-30"
            const dateKey = new Date(t.date).toDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(t);
        });

        return groups;
    }, [transactions]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this transaction?")) {
            await deleteTransaction(userId, id);
        }
    }

    const handleClearAll = async () => {
        if (window.confirm("Are you sure? This will wipe ALL data.")) {
            await clearHistory(userId);
        }
    }

    // Helper for Section Titles (Today, Yesterday, Dec 12...)
    const getSectionTitle = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "EEE, dd MMM yyyy"); // "Mon, 12 Dec 2025"
    };

    return (
        <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-20">
                <div>
                    <h2 className="text-xl font-bold text-white">Transactions</h2>
                    <p className="text-sm text-zinc-400">Your recent financial activity</p>
                </div>
                <button
                    onClick={handleClearAll}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-full transition-colors"
                >
                    Clear History
                </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {Object.entries(grouped).map(([dateStr, items]) => (
                    <div key={dateStr} className="space-y-4">

                        {/* Sticky Date Header */}
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900 py-2 z-10">
                            {getSectionTitle(dateStr)}
                        </h3>

                        {/* List Items */}
                        <div className="space-y-3">
                            {items.map((t) => (
                                <div
                                    key={t.id}
                                    className="group flex items-center justify-between p-4 bg-zinc-950/50 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700 rounded-2xl transition-all duration-200 cursor-pointer"
                                >
                                    {/* Left: Icon + Text */}
                                    <div className="flex items-center gap-4">
                                        <CategoryIcon category={t.category} />

                                        <div className="flex flex-col">
                                            <span className="text-zinc-200 font-medium text-sm truncate max-w-[180px]">
                                                {t.description}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">{t.category}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                                                    {t.source}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Amount + Actions */}
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                            {t.type === 'income' ? '+' : '-'}₹{(t.amount / 100).toFixed(2)}
                                        </span>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(t.id!); }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {transactions.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <div className="inline-block p-4 rounded-full bg-zinc-800 mb-4">
                            <CategoryIcon category="Uncategorized" />
                        </div>
                        <p className="text-zinc-500">No transactions yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
