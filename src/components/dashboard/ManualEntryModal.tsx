'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { addTransaction } from '@/lib/firebase/server';
import { useAuth } from '@/context/AuthContext';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Food');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [dateOffset, setDateOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedDate = addDays(new Date(), dateOffset);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) {
            setError('Please enter a valid amount greater than 0.');
            return;
        }
        if (!description.trim()) {
            setError('Please enter a description.');
            return;
        }
        if (!user?.uid) {
            setError('You must be logged in to add transactions.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await addTransaction({
                userId: user.uid,
                date: selectedDate,
                amount: Math.round(numAmount * 100), // Convert rupees to paise
                description: description.trim(),
                category,
                type,
                source: 'manual',
                status: 'verified',
            });

            if (result.success) {
                // Reset form
                setAmount('');
                setDescription('');
                setCategory('Food');
                setType('expense');
                setDateOffset(0);
                onClose();
            } else {
                setError(result.error || 'Failed to save transaction.');
            }
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Categories
    const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Utilities', 'Health', 'Entertainment'];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto z-[101] w-full max-w-md h-fit p-6"
                    >
                        <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-white/10 bg-[#0B0C10]/90">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-white text-xl font-bold">Add Transaction</h2>
                                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Amount Input - Big & Bold */}
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-2xl font-light">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        min="0.01"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['expense', 'income'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                                                    type === t
                                                        ? t === 'expense'
                                                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                                                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {t === 'expense' ? '↑ Expense' : '↓ Income'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Coffee, Uber, Netflix..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-all"
                                        required
                                    />
                                </div>

                                {/* Tactile Date Slider */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Date</label>
                                    <div className="bg-white/5 rounded-xl p-1 flex relative">
                                        <motion.div
                                            className="absolute bg-primary/20 border border-primary/30 rounded-lg h-[calc(100%-8px)] top-1 w-1/3"
                                            animate={{ x: `${(dateOffset + 1) * 100}%` }} // Simplified visual logic approx
                                        // Actually better to just render buttons and highlight active
                                        />
                                        <div className="grid grid-cols-3 w-full relative z-10">
                                            {[-1, 0, 1].map((offset) => {
                                                const d = addDays(new Date(), offset);
                                                const isActive = dateOffset === offset;
                                                return (
                                                    <button
                                                        key={offset}
                                                        type="button"
                                                        onClick={() => setDateOffset(offset)}
                                                        className={`py-2 text-xs font-medium rounded-lg transition-colors ${isActive ? 'text-white bg-primary/20 border border-primary/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                    >
                                                        {offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : format(d, 'MMM d')}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Chips */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === cat
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <p className="text-rose-400 text-sm text-center">{error}</p>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">add_circle</span>
                                            Add Transaction
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
