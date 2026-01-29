'use client';

import { ArrowLeft, ChevronDown, ChevronRight, Target, User, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface MobileTotalSpendsProps {
    onBack: () => void;
    totalExpense: number;
}

// Mock Data for the Area Chart
const dailyData = [
    { day: '01', amount: 900 },
    { day: '02', amount: 1500 },
    { day: '03', amount: 800 },
    { day: '04', amount: 2000 },
    { day: '05', amount: 5500, label: 'Highest' }, // The spike
    { day: '06', amount: 3200 },
    { day: '07', amount: 1800 },
    { day: '08', amount: 1200 },
    { day: '09', amount: 2400 },
    { day: '10', amount: 1600 },
    { day: '11', amount: 1100 },
    { day: '12', amount: 1900 },
    { day: '13', amount: 1300 },
    { day: '14', amount: 900 },
];

export default function MobileTotalSpends({ onBack, totalExpense }: MobileTotalSpendsProps) {

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-indigo-950 text-white p-3 rounded-xl shadow-xl border-none">
                    {payload[0].payload.label && (
                        <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded absolute -top-2 left-2">
                            {payload[0].payload.label}
                        </span>
                    )}
                    <p className="text-sm font-bold">{formatCurrency(payload[0].value)}</p>
                    <p className="text-[10px] text-zinc-300">Mon, 05 Jan</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 pb-10 font-sans">
            {/* 1. Header */}
            <header className="px-5 pt-6 pb-4 flex justify-between items-center bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-900">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-900"><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 10" /><path d="M6 13h3" /><path d="M9 13a4 4 0 0 1 7.6 2" /><path d="M16.6 15a4 4 0 0 1-5.6 3" /></svg>
                    </div>
                </div>
                <button className="text-[11px] font-bold text-indigo-900">HELP</button>
            </header>

            {/* 2. Main Amount */}
            <div className="text-center px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-medium">Total spend</span>
                    <span className="text-xs text-slate-300">|</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-700 flex items-center justify-center text-[6px] text-white font-bold rounded-sm">H</div>
                        <span className="text-xs font-bold text-slate-900">HDFC - 5130</span>
                        <ChevronDown size={12} className="text-slate-500" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900">{formatCurrency(totalExpense)}</h1>
            </div>

            {/* 3. Budget Banner */}
            <div className="px-5 mt-8 mb-8">
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-900 flex items-center justify-center">
                            <Target size={16} className="text-indigo-900" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Set your monthly budget</h3>
                            <p className="text-[11px] text-slate-500">& take control of your expenses</p>
                        </div>
                    </div>
                    <button className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <ChevronRight size={14} className="text-slate-900" />
                    </button>
                </div>
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

                {/* Custom CSS Bar Chart */}
                <div className="relative h-48 mt-12 mb-4 flex items-end justify-center gap-16 px-4">
                    {/* Dashed Connector Line (Absolute) */}
                    <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-48 border-t-2 border-dashed border-slate-200 -z-10"></div>

                    {/* Pill - Difference */}
                    <div className="absolute top-[42%] left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm z-10 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                        ₹16,973.78
                    </div>

                    {/* Bar 1 - Last Month */}
                    <div className="flex flex-col items-center gap-2 h-[80%]">
                        <div className="bg-indigo-950 text-white text-[10px] font-bold px-2 py-1 rounded relative">
                            ₹27,009.78
                            {/* Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-950"></div>
                        </div>
                        <div className="w-12 bg-slate-200 rounded-t-sm h-full flex-1 w-full"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Dec 1 - 14</span>
                    </div>

                    {/* Bar 2 - This Month */}
                    <div className="flex flex-col items-center gap-2 h-[40%] text-center">
                        <div className="bg-indigo-950 text-white text-[10px] font-bold px-2 py-1 rounded relative">
                            {formatCurrency(totalExpense)}
                            {/* Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-950"></div>
                        </div>
                        <div className="w-12 bg-zinc-400 rounded-t-sm h-full flex-1 w-full opacity-60"></div>
                        <span className="text-[10px] text-slate-900 font-bold uppercase tracking-wider mt-1">Jan 1 - 14</span>
                    </div>
                </div>
            </div>

            {/* 5. Spend Changes Grid */}
            <div className="px-5 mb-10">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Spend changes compared to last month</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'People', amount: '11,198', icon: <User size={16} /> },
                        { label: 'Uncategorized', amount: '3,124.54', icon: <div className="w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-bold">₹</div> },
                        { label: 'Wallet', amount: '2,367', icon: <Wallet size={16} /> }
                    ].map((item, i) => (
                        <div key={i} className="border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-2 text-slate-900">
                                {item.icon}
                            </div>
                            <span className="text-xs text-slate-700 font-medium mb-1">{item.label}</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                                ₹{item.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Daily Spends Chart (Recharts) */}
            <div className="px-5 pb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Daily spends</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="colorSpends" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                interval="preserveStartEnd"
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#cbd5e1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorSpends)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between px-2 text-[10px] text-slate-400 font-bold tracking-wider mt-[-20px] relative z-0">
                        <span>01 JAN</span>
                        <span>14 JAN</span>
                    </div>
                </div>
            </div>

            {/* Footer Button */}
            <div className="px-5 mt-4">
                <button className="w-full py-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-900">
                    View transaction history
                </button>
            </div>

        </div>
    );
}
