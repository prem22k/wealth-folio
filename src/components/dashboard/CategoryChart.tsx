'use client';

import { useMemo } from 'react';
import { Transaction, toRupees } from '@/types/schema';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface CategoryChartProps {
    transactions: Transaction[];
}

const COLORS = [
    '#3b82f6', // blue-500
    '#f97316', // orange-500
    '#10b981', // emerald-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#475569', // slate-600 (Others)
];

export default function CategoryChart({ transactions }: CategoryChartProps) {
    const { data, totalExpense } = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const total = expenses.reduce((sum, t) => sum + t.amount, 0);

        if (total === 0) return { data: [], totalExpense: 0 };

        // Group by Category
        const categoryMap = new Map<string, number>();
        expenses.forEach(t => {
            const cat = t.category || 'Uncategorized';
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount);
        });

        // Convert to Array & Sort
        let chartData = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Group Others if more than 5
        if (chartData.length > 5) {
            const top5 = chartData.slice(0, 5);
            const others = chartData.slice(5).reduce((sum, item) => sum + item.value, 0);
            chartData = [...top5, { name: 'Others', value: others }];
        }

        return { data: chartData, totalExpense: total };
    }, [transactions]);

    if (totalExpense === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full min-h-[400px] flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold text-slate-100 mb-6 self-start">Expenses by Category</h2>
                <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex items-center justify-center text-slate-500 font-medium">
                    No Data
                </div>
                <p className="text-slate-500 text-sm mt-4">
                    Add expenses to see the breakdown.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Expenses by Category</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 flex-1">
                {/* Chart Section */}
                <div className="w-full md:w-1/2 h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => formatCurrency(toRupees(value || 0))}
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                itemStyle={{ color: '#f1f5f9' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Inner Text - Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-slate-400 text-xs font-medium">Total</span>
                        <span className="text-slate-200 font-bold text-lg">
                            {formatCurrency(toRupees(totalExpense))}
                        </span>
                    </div>
                </div>

                {/* Legend Section */}
                <div className="w-full md:w-1/2 space-y-3">
                    {data.map((item, index) => {
                        const percent = ((item.value / totalExpense) * 100).toFixed(1);
                        return (
                            <div key={index} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-slate-300 text-sm font-medium truncate max-w-[120px]" title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500 text-xs">{percent}%</span>
                                    <span className="text-slate-200 text-sm font-medium">
                                        {formatCurrency(toRupees(item.value))}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
