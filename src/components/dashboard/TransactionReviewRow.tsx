'use client';

import { ParsedTransaction } from '@/lib/parsers/sbi';
import { toRupees, toPaise } from '@/types/schema';
import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TransactionReviewRowProps {
    transaction: ParsedTransaction;
    onUpdate: (updated: ParsedTransaction) => void;
    onDelete: () => void;
}

const CATEGORIES = [
    'Food',
    'Travel',
    'Shopping',
    'Bills',
    'Transfer',
    'Salary',
    'Medical',
    'Entertainment',
    'Investment',
    'Uncategorized'
];

export default function TransactionReviewRow({ transaction, onUpdate, onDelete }: TransactionReviewRowProps) {
    // Local state for smooth typing, commit on blur/change
    const [amountRupees, setAmountRupees] = useState(toRupees(transaction.amount));

    // Update local state if prop changes upstream
    useEffect(() => {
        setAmountRupees(toRupees(transaction.amount));
    }, [transaction.amount]);

    const handleChange = (field: keyof ParsedTransaction, value: any) => {
        onUpdate({
            ...transaction,
            [field]: value
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmountRupees(parseFloat(val));
    };

    const handleAmountBlur = () => {
        // Commit change to parent as Paise
        // Handle NaN case
        const validRupees = isNaN(amountRupees) ? 0 : amountRupees;
        handleChange('amount', Math.round(validRupees * 100)); // Manual conversion approx toPaise logic but ensuring math round
    };

    // Date formatting for input type="date" (YYYY-MM-DD)
    // Transaction date is likely a Date object or string depending on where it came from
    // In ParsedTransaction type it is Date.
    const dateValue = new Date(transaction.date).toISOString().split('T')[0];

    return (
        <tr className="hover:bg-slate-800/30 transition-colors group">
            {/* Date */}
            <td className="px-2 py-2">
                <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => handleChange('date', new Date(e.target.value))}
                    className="bg-transparent text-slate-300 text-sm border border-transparent hover:border-slate-700 focus:border-blue-500 rounded px-2 py-1 outline-none w-full cursor-pointer"
                />
            </td>

            {/* Description */}
            <td className="px-2 py-2">
                <input
                    type="text"
                    value={transaction.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="bg-transparent text-slate-200 text-sm border border-transparent hover:border-slate-700 focus:border-blue-500 rounded px-2 py-1 outline-none w-full"
                    placeholder="Description"
                />
            </td>

            {/* Category */}
            <td className="px-2 py-2">
                <select
                    value={transaction.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="bg-transparent text-slate-300 text-sm border border-transparent hover:border-slate-700 focus:border-blue-500 rounded px-2 py-1 outline-none w-full cursor-pointer appearance-none"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                            {cat}
                        </option>
                    ))}
                </select>
            </td>

            {/* Amount */}
            <td className="px-2 py-2">
                <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                    <input
                        type="number"
                        step="0.01"
                        value={amountRupees}
                        onChange={handleAmountChange}
                        onBlur={handleAmountBlur}
                        className={`bg-transparent text-sm border border-transparent hover:border-slate-700 focus:border-blue-500 rounded pl-5 pr-2 py-1 outline-none w-24 text-right
                            ${transaction.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}
                        `}
                    />
                </div>
            </td>

            {/* Actions */}
            <td className="px-2 py-2 text-center">
                <button
                    onClick={onDelete}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Transaction"
                >
                    <X size={16} />
                </button>
            </td>
        </tr>
    );
}
