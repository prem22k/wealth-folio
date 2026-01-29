'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Upload, FileText, Loader2, Check, X, AlertCircle, Lock, Brain, Zap, Copy } from 'lucide-react';
import { processStatement } from '@/app/actions/upload-statement';
import { ParsedTransaction } from '@/lib/parsers/sbi';
import { toRupees } from '@/types/schema';
import { useAuth } from '@/context/AuthContext';
import { saveBulkTransactions } from '@/lib/firebase/transactions';
import TransactionReviewRow from './TransactionReviewRow';
import SmartCategorizer from './SmartCategorizer';
import { formatCurrency } from '@/lib/formatters';

interface BulkCandidate {
    description: string;
    oldCategory: string;
    newCategory: string;
    count: number;
}

export default function StatementUploader() {
    // UI State
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Data State
    const [reviewMode, setReviewMode] = useState(false);
    const [showSmartCategorizer, setShowSmartCategorizer] = useState(false);
    const [draftTransactions, setDraftTransactions] = useState<ParsedTransaction[]>([]);

    // Bulk Categorize State
    const [bulkCandidate, setBulkCandidate] = useState<BulkCandidate | null>(null);

    // Inputs
    const [password, setPassword] = useState('');
    const [useAI, setUseAI] = useState(true); // Default to Smart Mode

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setError(null);
        setIsUploading(true);
        setDraftTransactions([]);
        setBulkCandidate(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);
            formData.append('mode', useAI ? 'smart' : 'fast');

            const result = await processStatement(formData);

            if (result.success && result.data) {
                setDraftTransactions(result.data);
                setShowSmartCategorizer(true); // Start Wizard
                // setReviewMode(true); // Don't show table yet
            } else {
                setError(result.error || 'Failed to parse statement.');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');
        } finally {
            setIsUploading(false);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [password, useAI]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleDiscard = () => {
        setReviewMode(false);
        setShowSmartCategorizer(false);
        setDraftTransactions([]);
        setBulkCandidate(null);
        setError(null);
        setPassword('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Review Actions
    const handleUpdateTransaction = (index: number, updated: ParsedTransaction) => {
        const oldTxn = draftTransactions[index];

        // Check for category change for Bulk Action
        if (oldTxn.category !== updated.category) {
            // Find counts
            // Logic: partial match or exact match?  
            // Let's use simple inclusion check for safety or exact prefix?
            // User request said "includes 'Chandra'".
            // Let's look for significant overlap. Simple approach for now:
            // If descriptions share the first 10 chars or so? 
            // Better: Exactly matching descriptions (normalized) often works best for statements.
            // OR checks for substring.

            // Refined Logic based on request "includes 'Chandra'"
            // We'll use the current description as the "search key" if it's long enough.
            // BUT usually statements have "UPI/DR/12323/Chandra/..."
            // It's safer to just match EXACT Description for now to avoid false positives,
            // or perhaps a heuristic. 
            // LET'S STICK TO: Same Description string. 
            // Otherwise we need to ask user "what part of string matches?"

            // Wait, request says: "when I change category for 'Chandra'..." implying 'Chandra' is the description?
            // If description is "UPI-Chandra", and I change it.
            // Let's find other transactions with EXACTLY same description first.
            const similarCount = draftTransactions.filter(t => t.description === oldTxn.description && t.category !== updated.category).length;

            if (similarCount > 1) { // 1 because it includes the one we are editing (before update)
                setBulkCandidate({
                    description: oldTxn.description,
                    oldCategory: oldTxn.category,
                    newCategory: updated.category,
                    count: similarCount
                });
            }
        }

        setDraftTransactions(prev => {
            const next = [...prev];
            next[index] = updated;
            return next;
        });
    };

    const handleBulkApply = () => {
        if (!bulkCandidate) return;

        setDraftTransactions(prev => prev.map(txn => {
            if (txn.description === bulkCandidate.description) {
                return { ...txn, category: bulkCandidate.newCategory };
            }
            return txn;
        }));

        setBulkCandidate(null);
    };

    const handleBulkDismiss = () => {
        setBulkCandidate(null);
    };

    const handleDeleteTransaction = (index: number) => {
        setDraftTransactions(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = async () => {
        if (!user || draftTransactions.length === 0) return;

        setIsSaving(true);
        try {
            await saveBulkTransactions(user.uid, draftTransactions);
            alert(`Successfully saved ${draftTransactions.length} transactions!`);
            handleDiscard(); // Reset to upload screen
        } catch (err) {
            console.error('Error saving transactions:', err);
            setError('Failed to save transactions. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSmartCategorizerComplete = (updatedTransactions: ParsedTransaction[]) => {
        setDraftTransactions(updatedTransactions);
        setShowSmartCategorizer(false);
        setReviewMode(true); // Now show the review table
    };

    const handleSmartCategorizerCancel = () => {
        // If they cancel the wizard, do we discard or just go to review?
        // Usually go to review with whatever they have.
        setShowSmartCategorizer(false);
        setReviewMode(true);
    };

    // Totals for Review
    const totals = useMemo(() => {
        return draftTransactions.reduce((acc, txn) => {
            if (txn.type === 'income') acc.income += txn.amount;
            else acc.expense += txn.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [draftTransactions]);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg relative">

            {showSmartCategorizer && (
                <SmartCategorizer
                    transactions={draftTransactions}
                    onComplete={handleSmartCategorizerComplete}
                    onCancel={handleSmartCategorizerCancel}
                />
            )}

            {/* Bulk Categorize Toast */}
            {bulkCandidate && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-3">
                        <Copy size={20} className="text-blue-100" />
                        <div>
                            <p className="font-medium text-sm">Update matching transactions?</p>
                            <p className="text-xs text-blue-100">
                                Apply <strong>{bulkCandidate.newCategory}</strong> to {bulkCandidate.count - 1} other items with description "{bulkCandidate.description.substring(0, 15)}..."?
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDismiss}
                            className="px-3 py-1.5 text-xs font-medium text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={handleBulkApply}
                            className="px-4 py-1.5 text-xs font-bold bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm transition-colors"
                        >
                            Apply All
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {reviewMode ? 'Review Draft Transactions' : 'Statement Upload'}
                </h2>
                {reviewMode && (
                    <button
                        onClick={handleDiscard}
                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Discard All
                    </button>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* UPLOAD VIEW */}
            {!reviewMode && (
                <div className="flex flex-col gap-6">

                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
                        {/* Password */}
                        <div className="w-full md:w-1/2">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-2 mb-2">
                                <Lock size={12} /> PDF Password (if protected)
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isUploading}
                            />
                        </div>

                        {/* AI Switch */}
                        <div className="w-full md:w-auto flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
                            <button
                                onClick={() => setUseAI(false)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!useAI ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Zap size={14} /> Fast Mode
                            </button>
                            <button
                                onClick={() => setUseAI(true)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useAI ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Brain size={14} /> Use AI
                            </button>
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                            ${isDragging
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                            }
                            ${isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={onFileSelect}
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                <p className="text-slate-400 font-medium">
                                    {useAI ? 'AI Analyzing Statement...' : 'Parsing PDF...'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-slate-800 rounded-full">
                                    <Upload className="h-8 w-8 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-slate-200">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        SBI PDF Statements only
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* REVIEW VIEW */}
            {reviewMode && (
                <div className="space-y-6 animate-in fade-in duration-300">

                    {/* Draft Totals */}
                    <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <span className="text-slate-400 text-sm font-medium">Draft Summary</span>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-xs text-slate-400">Income:</span>
                                <span className="text-sm font-bold text-emerald-400">{formatCurrency(totals.income)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-xs text-slate-400">Expense:</span>
                                <span className="text-sm font-bold text-red-400">{formatCurrency(totals.expense)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm text-slate-400 relative">
                            <thead className="bg-slate-800 text-slate-200 uppercase font-medium sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-3 w-[140px]">Date</th>
                                    <th className="px-2 py-3 min-w-[200px]">Description</th>
                                    <th className="px-2 py-3 w-[140px]">Category</th>
                                    <th className="px-2 py-3 w-[120px] text-right">Amount</th>
                                    <th className="px-2 py-3 w-[50px] text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 bg-slate-900">
                                {draftTransactions.map((txn, index) => (
                                    <TransactionReviewRow
                                        key={index}
                                        transaction={txn}
                                        onUpdate={(updated) => handleUpdateTransaction(index, updated)}
                                        onDelete={() => handleDeleteTransaction(index)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-slate-500">
                            {draftTransactions.length} transactions found.
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDiscard}
                                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Discard
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSaving || draftTransactions.length === 0}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-medium rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                {isSaving ? 'Saving...' : 'Confirm & Save All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
