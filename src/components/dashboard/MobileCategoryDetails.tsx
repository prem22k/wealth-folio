'use client';

import { ArrowLeft, ArrowUpDown, ChevronDown, User } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface MobileCategoryDetailsProps {
    onBack: () => void;
    categoryName: string;
    totalAmount: number;
}

export default function MobileCategoryDetails({ onBack, categoryName, totalAmount }: MobileCategoryDetailsProps) {
    // Mock Transactions for this view based on screenshot
    const transactions = [
        { id: 1, name: 'mr amjad khan', date: 'Mon, 12 Jan 2026', amount: 80, initials: 'MA', color: 'bg-blue-600' },
        { id: 2, name: 'badikishan wale suni', date: 'Mon, 12 Jan 2026', amount: 150, initials: 'BW', color: 'bg-purple-600' },
        { id: 3, name: 'groceries store', date: 'Sat, 10 Jan 2026', amount: 450, initials: 'GS', color: 'bg-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-10 font-sans">
            {/* 1. Header */}
            <header className="px-5 pt-6 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-900">
                    <ArrowLeft size={24} />
                </button>
                <button className="text-[11px] font-bold text-indigo-900">HELP</button>
            </header>

            {/* 2. Category Icon & Name */}
            <div className="flex flex-col items-center mt-2">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-3">
                    <User size={32} className="text-indigo-950" strokeWidth={1.5} />
                </div>
                <div className="bg-slate-50 px-4 py-1.5 rounded-full flex items-center gap-2 mb-6">
                    <span className="text-sm font-bold text-slate-900">{categoryName}</span>
                    <ChevronDown size={14} className="text-slate-900" />
                </div>
            </div>

            {/* 3. Main Amount */}
            <div className="text-center px-4 mb-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-medium">Total spend</span>
                    <span className="text-xs text-slate-300">|</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-700 flex items-center justify-center text-[6px] text-white font-bold rounded-sm">H</div>
                        <span className="text-xs font-bold text-slate-900">HDFC - 5130</span>
                        <ChevronDown size={12} className="text-slate-500" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900">{formatCurrency(totalAmount)}</h1>
            </div>

            {/* 4. Past Spends (Comparison Chart) */}
            <div className="px-5 mb-10">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-slate-900">Past spends</h3>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-100">
                        <span className="text-xs font-semibold text-slate-600">This month vs last</span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </div>
                </div>

                {/* Custom CSS Bar Chart (Reused) */}
                <div className="relative h-48 mt-12 mb-4 flex items-end justify-center gap-16 px-4">
                    {/* Dashed Connector Line (Absolute) */}
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-48 border-t-2 border-dashed border-slate-200 -z-10"></div>

                    {/* Pill - Difference */}
                    <div className="absolute top-[42%] left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm z-10 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                        ₹11,198
                    </div>

                    {/* Bar 1 - Last Month */}
                    <div className="flex flex-col items-center gap-2 h-[80%]"> // Taller bar for diff
                        <div className="bg-indigo-950 text-white text-[10px] font-bold px-2 py-1 rounded relative">
                            ₹18,232
                            {/* Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-950"></div>
                        </div>
                        <div className="w-12 bg-slate-200 rounded-t-sm h-full flex-1 w-full"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Dec 1 - 14</span>
                    </div>

                    {/* Bar 2 - This Month */}
                    <div className="flex flex-col items-center gap-2 h-[40%] text-center">
                        <div className="bg-indigo-950 text-white text-[10px] font-bold px-2 py-1 rounded relative">
                            {formatCurrency(totalAmount)}
                            {/* Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-950"></div>
                        </div>
                        <div className="w-12 bg-zinc-400 rounded-t-sm h-full flex-1 w-full opacity-60"></div>
                        <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider mt-1">Jan 1 - 14</span>
                    </div>
                </div>
            </div>

            {/* 5. Transactions List Header */}
            <div className="px-5 mb-4 flex justify-between items-end">
                <h3 className="text-lg font-bold text-slate-900">Transactions involved</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                    Recent first <ArrowUpDown size={12} />
                </div>
            </div>

            {/* 6. Transactions List Items */}
            <div className="px-0">
                {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start gap-4 p-4 border-b border-slate-50 active:bg-slate-50">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full ${tx.color} flex items-center justify-center text-xs font-medium text-white shrink-0`}>
                            {tx.initials}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-slate-900 text-[15px] truncate pr-4">{tx.name}</h4>
                                <span className="font-bold text-slate-900 text-[15px]">{formatCurrency(tx.amount)}</span>
                            </div>

                            {/* Category Pill */}
                            <div className="mt-1 mb-2">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                                    {categoryName}
                                </span>
                            </div>

                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[11px] text-slate-500 font-medium">{tx.date}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-slate-400 font-medium">Paid from</span>
                                    <div className="w-4 h-4 rounded-[2px] border border-blue-900 flex items-center justify-center bg-white relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white"></div>
                                        <div className="w-1.5 h-1.5 bg-red-600 z-10 absolute top-0 left-0"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-800 z-10 absolute bottom-0 right-0"></div>
                                        <div className="w-1 h-1 bg-blue-800 z-10 absolute top-0.5 left-0.5 opacity-0"></div>
                                        {/* Simplified HDFC logo approximation */}
                                        <div className="absolute inset-[3px] border border-blue-900 z-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
