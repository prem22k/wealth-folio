'use client';
import { useState } from 'react';
import MobileTotalSpends from './MobileTotalSpends';
import MobileCategoryDetails from './MobileCategoryDetails';

import { Transaction } from '@/types/schema';
import { useAuth } from '@/context/AuthContext';
import { Plus, RefreshCw, ChevronRight, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';

interface MobileDashboardProps {
    transactions: Transaction[];
    totalExpense: number;
    netBalance: number;
}

// --- Sub-Components for Exact Styling ---

const MobileHeader = ({ userName }: { userName: string }) => (
    <div className="pt-3 px-5 pb-4 bg-white relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
            <button className="p-1 -ml-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            <button className="text-[11px] font-bold text-indigo-900 tracking-wider">HELP</button>
        </div>

        {/* Greeting */}
        <div>
            <h1 className="text-xl font-bold text-slate-900">
                Hi {userName},
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
                Take a closer look at where your money goes
            </p>
        </div>
    </div>
);

const AccountCard = ({ balance }: { balance: number }) => (
    <div className="px-5 mb-8 bg-white">
        <div className="border border-slate-100 rounded-2xl shadow-sm bg-white p-4">
            {/* Account Selector Row */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5 bg-white shadow-sm">
                    {/* HDFC Logo Placeholder */}
                    <div className="w-4 h-4 bg-blue-900 flex items-center justify-center text-[8px] text-white font-bold rounded-sm">H</div>
                    <span className="text-[11px] font-bold text-slate-800 tracking-wide">HDFC - 5130</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                    <Plus size={14} className="text-slate-900" />
                    <span className="text-[11px] font-bold text-slate-900">Add account</span>
                </button>
            </div>

            {/* Balance Row */}
            <div className="flex gap-4 mb-6">
                {/* Bank Logo */}
                <div className="w-10 h-10 border border-slate-100 rounded-lg flex items-center justify-center p-1">
                    <div className="w-full h-full border-4 border-red-600 relative">
                        <div className="absolute inset-0 bg-blue-600 m-1.5"></div>
                    </div>
                </div>
                <div>
                    <span className="text-xs text-slate-500 font-medium block">Total balance</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(balance)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-medium">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        <span>Last updated just now</span>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <button className="w-full py-3 bg-slate-50 rounded-xl text-xs font-bold text-indigo-900 flex items-center justify-center gap-2">
                <RefreshCw size={14} strokeWidth={2.5} />
                Refresh Balance
            </button>
        </div>
    </div>
);


interface MonthlySummaryProps {
    totalExpense: number;
    onTotalClick: () => void;
    onCategoryClick: (category: string) => void;
}

const MonthlySummary = ({ totalExpense, onTotalClick, onCategoryClick }: MonthlySummaryProps) => {
    // Mock Categories based on image
    const categories = [
        { name: 'People', amount: 7034, color: 'bg-blue-600' },
        { name: 'UPI Transfers', amount: 1596, color: 'bg-yellow-400' },
        { name: 'Merchant Transfers', amount: 392, color: 'bg-purple-600' },
        { name: 'Others', amount: 1014, color: 'bg-orange-500' },
    ];
    // ... rest of component

    return (
        <div className="px-5 mb-8 bg-white pt-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Monthly summary</h3>
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                    Jan 2026 <ChevronRight size={18} />
                </div>
            </div>

            <div
                onClick={onTotalClick}
                className="border border-slate-100 rounded-2xl shadow-sm bg-white p-5 cursor-pointer hover:bg-slate-50 transition-colors"
            >
                {/* Total Spends Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        {/* Rupee generic icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-900"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 10" /><path d="M6 13h3" /><path d="M9 13a4 4 0 0 1 7.6 2" /><path d="M16.6 15a4 4 0 0 1-5.6 3" /></svg>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Total spends</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-slate-900">{formatCurrency(totalExpense)}</span>
                            <ChevronRight size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Insight Pill */}
                <div className="bg-emerald-50 rounded px-3 py-2 text-[11px] font-bold text-emerald-700 flex items-center gap-2 mb-6">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                    ₹16,973.78 Spent less vs December this time
                </div>

                {/* Top Spend Categories Header */}
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                    TOP SPEND CATEGORIES
                </h4>

                {/* Progress Bar */}
                <div className="h-2.5 w-full flex rounded-full overflow-hidden mb-6">
                    <div className="bg-blue-600 w-[60%] h-full"></div>
                    <div className="bg-yellow-400 w-[20%] h-full"></div>
                    <div className="bg-purple-600 w-[10%] h-full"></div>
                    <div className="bg-orange-500 w-[10%] h-full"></div>
                </div>

                {/* Categories List */}
                <div className="space-y-5">
                    {categories.map((cat, i) => (
                        <div
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCategoryClick(cat.name);
                            }}
                            className="flex items-center justify-between py-1 cursor-pointer active:opacity-70"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${cat.color} border border-white shadow-sm ring-1 ring-slate-100`}></div>
                                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                                <ChevronRight size={12} className="text-slate-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Start of Transaction Section
const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
    // Helper for initials
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    // Helper for consistent avatar colors based on name like in image (Blue, Purple, Orange)
    const getAvatarColor = (name: string) => {
        const char = name.charCodeAt(0);
        if (char % 3 === 0) return 'bg-blue-700';
        if (char % 3 === 1) return 'bg-purple-700';
        return 'bg-yellow-600';
    };

    return (
        <div className="px-5 bg-white pb-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent transactions</h3>

            {/* Info Message */}
            <div className="bg-slate-50 p-4 rounded-xl flex gap-3 mb-6">
                <Info size={18} className="text-slate-500 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Bank transactions are from <strong className="text-slate-900">just now</strong>. Navi UPI transactions are up to date.
                </p>
            </div>

            {/* Account Filters - Horizontal Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 no-scrollbar">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-900 rounded-full shrink-0">
                    <div className="w-3 h-3 bg-blue-900 text-[6px] text-white flex items-center justify-center">H</div>
                    <span className="text-xs font-bold text-slate-900">HDFC - 5130</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full shrink-0">
                    <Plus size={14} className="text-slate-900" />
                    <span className="text-xs font-bold text-slate-900">Add account</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {transactions.slice(0, 5).map((txn, i) => (
                    <div key={txn.id || i} className="flex justify-between items-start">
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(txn.description)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                {getInitials(txn.description)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 mb-1">{txn.description}</p>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{txn.category || 'People'}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {format(new Date(txn.date), 'EEE, dd MMM yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block mb-1">
                                ₹{(txn.amount / 100).toLocaleString('en-IN')}
                            </span>
                            <div className="flex items-center justify-end gap-1">
                                <span className="text-[10px] text-slate-500 font-medium">Paid from</span>
                                {/* Tiny Bank Logo */}
                                <div className="w-3 h-3 border border-red-500 relative">
                                    <div className="absolute inset-0 bg-blue-700 m-0.5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
                <button className="w-full py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-900">
                    View all transactions
                </button>
            </div>

            {/* Feedback & FAB Section */}
            <div className="mt-8 bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div className="z-10">
                    <h4 className="text-sm font-bold text-slate-900">Tell us how we're doing?</h4>
                    <p className="text-xs text-slate-500 mt-1">What's working and what isn't?</p>
                    <button className="mt-3 px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-900">
                        Share Feedback
                    </button>
                </div>
                {/* Illustration placeholder */}
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-50"></div>
            </div>

            {/* Floating Bill Calendar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button className="bg-indigo-950 text-white pl-4 pr-5 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
                    <Calendar size={16} />
                    <span className="text-xs font-bold">Bill calendar</span>
                </button>
            </div>
        </div>
    );
}



export default function MobileDashboard({ transactions, totalExpense, netBalance }: MobileDashboardProps) {
    const { user } = useAuth();
    // Default to 'Kota Swetha' style if user name is missing, but typically use real name
    const DisplayName = user?.displayName || 'User';


    // Navigation State
    const [view, setView] = useState<'dashboard' | 'total_spends' | 'category_details'>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Callback to switch view
    const handleTotalSpendClick = () => setView('total_spends');

    // Handle category click
    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        setView('category_details');
    };

    const handleBack = () => setView('dashboard');

    if (view === 'total_spends') {
        return <MobileTotalSpends onBack={handleBack} totalExpense={totalExpense} />;
    }

    if (view === 'category_details') {
        // Typically specific amount would come from real data aggregation
        return <MobileCategoryDetails onBack={handleBack} categoryName={selectedCategory} totalAmount={7034} />;
    }

    return (
        <div className="min-h-screen bg-white">
            <MobileHeader userName={DisplayName} />
            <AccountCard balance={netBalance} />
            <MonthlySummary
                totalExpense={totalExpense}
                onTotalClick={handleTotalSpendClick}
                onCategoryClick={handleCategoryClick}
            />
            <TransactionList transactions={transactions} />
        </div>
    );
}
