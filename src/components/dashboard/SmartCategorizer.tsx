'use client';

import { useState, useMemo, useEffect } from 'react';
import { ParsedTransaction } from '@/lib/parsers/sbi';
import { ArrowRight, Check, X, Sparkles, Edit2, Wallet } from 'lucide-react';

interface SmartCategorizerProps {
    transactions: ParsedTransaction[];
    onComplete: (updated: ParsedTransaction[]) => void;
    onCancel: () => void;
}

interface Group {
    originalDescription: string;
    indices: number[];
    count: number;
    sampleCategory: string; // The category of the first item found
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

export default function SmartCategorizer({ transactions, onComplete, onCancel }: SmartCategorizerProps) {
    // 1. Group transactions on mount
    // We only want to group the ones that need attention? Or all unique payees?
    // Request says "Scan... Group them". Usually we iterate all unique payees to verify.
    const groups = useMemo(() => {
        const map = new Map<string, Group>();
        transactions.forEach((txn, index) => {
            const desc = txn.description || 'Unknown';
            if (!map.has(desc)) {
                map.set(desc, {
                    originalDescription: desc,
                    indices: [],
                    count: 0,
                    sampleCategory: txn.category
                });
            }
            const group = map.get(desc)!;
            group.indices.push(index);
            group.count++;
        });
        // Convert to array and sort by count (desc) to tackle biggest groups first?
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [transactions]); // Only run once on mount conceptually (if transactions stable)

    // 2. Wizard State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [workingList, setWorkingList] = useState<ParsedTransaction[]>([...transactions]);

    // Current Group inputs
    const currentGroup = groups[currentIndex];
    const [renameVal, setRenameVal] = useState('');
    const [categoryVal, setCategoryVal] = useState('');

    // Sync inputs when switching groups
    useEffect(() => {
        if (currentGroup) {
            setRenameVal(currentGroup.originalDescription);
            setCategoryVal(currentGroup.sampleCategory);
        } else if (currentIndex >= groups.length && groups.length > 0) {
            // All done automatically? Or waiting for user to click finish logic
        }
    }, [currentGroup, currentIndex, groups.length]);

    const handleApply = () => {
        if (!currentGroup) return;

        // Update all items in this group
        const nextList = [...workingList];
        currentGroup.indices.forEach(idx => {
            nextList[idx] = {
                ...nextList[idx],
                description: renameVal.trim(),
                category: categoryVal
            };
        });
        setWorkingList(nextList);

        // Move next
        if (currentIndex < groups.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Last item processed
            onComplete(nextList);
        }
    };

    const handleSkip = () => {
        // Just move next without changing anything 
        // (Is skip allowed? "Apply" implies confirmation. Maybe skip means keep as is)
        if (currentIndex < groups.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete(workingList);
        }
    };

    if (!currentGroup) {
        return null; // or loading
    }

    const progress = Math.round(((currentIndex) / groups.length) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Sparkles size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Smart Categorizer</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                            {currentIndex + 1} / {groups.length} Groups
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 pt-0 overflow-y-auto">
                    <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-indigo-500/20">
                        <h3 className="text-lg text-slate-200 font-medium mb-1">
                            Who is <span className="text-white font-bold">"{currentGroup.originalDescription}"</span>?
                        </h3>
                        <p className="text-sm text-slate-400">
                            Found {currentGroup.count} transaction{currentGroup.count > 1 ? 's' : ''} like this.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Rename Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                                <Edit2 size={12} /> Rename Payee (Optional)
                            </label>
                            <input
                                type="text"
                                value={renameVal}
                                onChange={(e) => setRenameVal(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="e.g. Mom, Zomato, Rent"
                            />
                        </div>

                        {/* Category Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                                <Wallet size={12} /> Assign Category
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryVal(cat)}
                                        className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${categoryVal === cat
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                    <button
                        onClick={onCancel}
                        className="text-slate-500 hover:text-white text-sm px-4 py-2 transition-colors"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 font-medium flex items-center gap-2 transition-all active:scale-95"
                        >
                            {currentIndex === groups.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
