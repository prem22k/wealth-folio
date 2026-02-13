'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { processStatement } from '@/app/actions/upload-statement';
import { ParsedTransaction } from '@/lib/parsers/sbi';
import { saveBulkTransactions } from '@/lib/firebase/transactions';
import {
    Lock, Shield, Eye, EyeOff, Check,
    AlertCircle, Upload, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

import { formatCurrency } from '@/lib/formatters';

export default function UnsealVault() {
    // UI State
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStep, setUploadStep] = useState<'idle' | 'decrypting' | 'analyzing' | 'complete'>('idle');

    // Data State
    const [reviewMode, setReviewMode] = useState(false);
    const [draftTransactions, setDraftTransactions] = useState<ParsedTransaction[]>([]);

    // Inputs
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleFile = async (file: File) => {
        if (!user) {
            setError('You must be logged in.');
            return;
        }

        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setError(null);
        setIsUploading(true);
        setUploadStep('decrypting');

        // Simulate animation steps for "Vault" effect
        await new Promise(r => setTimeout(r, 1500));
        setUploadStep('analyzing');

        try {
            const idToken = await user.getIdToken();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);
            formData.append('mode', 'smart'); // Default to smart
            formData.append('idToken', idToken);

            const result = await processStatement(formData);

            if (result.success && result.data) {
                setDraftTransactions(result.data);
                setUploadStep('complete');
                await new Promise(r => setTimeout(r, 500));
                setReviewMode(true);
            } else {
                setError(result.error || 'Failed to parse statement.');
                setUploadStep('idle');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');
            setUploadStep('idle');
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
    }, [password]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    // Review Logic (Reuse from StatementUploader simplified)
    const handleDiscard = () => {
        setReviewMode(false);
        setDraftTransactions([]);
        setError(null);
        setPassword('');
        setUploadStep('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async () => {
        if (!user || draftTransactions.length === 0) return;
        setIsSaving(true);
        try {
            await saveBulkTransactions(user.uid, draftTransactions);
            handleDiscard();
        } catch (err) {
            console.error(err);
            setError('Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    // If in Review Mode, we can mostly reuse the look or reuse the logic.
    // For MVP, let's keep review mode distinct/simple but functional.
    if (reviewMode) {
        return (
            <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in duration-300">
                <div className="glass-panel p-6 rounded-2xl relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                <Check className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
                                <p className="text-slate-400 text-sm">{draftTransactions.length} transactions found</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleDiscard} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Discard</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-colors shadow-[0_0_20px_rgba(54,35,225,0.4)] flex items-center gap-2">
                                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                Secure Import
                            </button>
                        </div>
                    </div>

                    {/* Quick Preview List */}
                    <div className="bg-[#0a0a12] rounded-xl border border-white/5 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-[#0f0f16] text-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {draftTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{tx.description}</td>
                                        <td className={`px-4 py-3 text-right font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                            {formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl animate-[fade-in-up_0.6s_ease-out]">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Secure Vault Analysis</h1>
                <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">ENCRYPTED ENVIRONMENT • AES-256-GCM</p>
            </div>

            <div
                className={`glass-panel rounded-[32px] p-1 relative overflow-hidden group/card transition-all duration-300
                    ${isDragging ? 'ring-1 ring-indigo-500/50' : ''}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {/* Subtle Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

                <div className="relative rounded-[28px] bg-[#0B0C10] p-8 sm:p-12">
                    {/* Badge */}
                    <div className="absolute top-8 right-8 flex items-center gap-2 rounded-full bg-emerald-950/20 border border-emerald-900/30 px-3 py-1 backdrop-blur-md">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">End-to-End Encrypted</span>
                    </div>

                    {/* Central Vault Door Animation */}
                    <div className="flex flex-col items-center justify-center py-6 mt-4">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={onFileSelect}
                                disabled={isUploading}
                            />

                            <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative h-64 w-64 flex items-center justify-center">
                                {/* Outer Gear/Lock Ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-[8px] border-dashed border-indigo-500/20"
                                    animate={{ rotate: isUploading ? 360 : 0 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />

                                <motion.div
                                    className="absolute inset-4 rounded-full border border-indigo-500/30 bg-[#0B0C10] shadow-2xl flex items-center justify-center"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: isUploading ? -360 : 0 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                >
                                    {/* Vault Spokes */}
                                    <div className="absolute inset-2 border border-white/5 rounded-full"></div>
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                                        <div key={deg} className="absolute w-full h-[1px] bg-white/5 top-1/2 left-0" style={{ transform: `rotate(${deg}deg)` }}></div>
                                    ))}

                                    {/* Inner Hub Content */}
                                    <div className="absolute inset-16 rounded-full bg-white/[0.02] backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center gap-4 text-center z-10 hover:bg-white/[0.04] transition-colors duration-300">
                                        <motion.div
                                            className={`rounded-full bg-gradient-to-b from-white/5 to-transparent p-4 ring-1 ring-white/5`}
                                            animate={{ scale: isUploading ? [1, 1.1, 1] : 1 }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
                                            ) : (
                                                <Lock className="h-10 w-10 text-indigo-400" />
                                            )}
                                        </motion.div>
                                        <div className="px-2">
                                            <p className="text-sm font-bold text-white tracking-tight leading-tight">
                                                {isUploading ? 'Processing Vault...' : 'Drop PDF'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Inputs & Status */}
                    <div className="mt-10 flex flex-col gap-6 max-w-[360px] mx-auto">

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-200 text-xs">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {/* Password Input */}
                        {!isUploading && (
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">PDF Password</label>
                                <div className="relative flex w-full items-center rounded-lg bg-black/40 border border-white/10 group-focus-within:border-primary/50 group-focus-within:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] transition-all">
                                    <div className="pl-3 pr-2 text-gray-500">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 font-mono text-sm py-3 px-2 tracking-widest"
                                        placeholder="••••••••••••••"
                                        type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="pr-3 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar / Steps */}
                        {isUploading && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <span className="text-xs font-bold text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse">
                                        {uploadStep === 'decrypting' ? 'Decrypting...' : uploadStep === 'analyzing' ? ' analyzing...' : 'Unlocking...'}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-600">
                                        {uploadStep === 'decrypting' ? 'STEP 1/3' : 'STEP 2/3'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-primary to-cyan-400 relative rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out
                                            ${uploadStep === 'decrypting' ? 'w-1/3' : uploadStep === 'analyzing' ? 'w-2/3' : 'w-full'}
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono mt-1 px-1">
                                    <div className={`font-bold transition-colors ${uploadStep === 'decrypting' ? 'text-indigo-400' : 'text-gray-600'}`}>DECRYPT</div>
                                    <div className={`font-medium transition-colors ${uploadStep === 'analyzing' ? 'text-indigo-400' : 'text-gray-600'}`}>ANALYZE</div>
                                    <div className="text-gray-600 font-medium">IMPORT</div>
                                </div>
                            </div>
                        )}

                        {!isUploading && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-10px_rgba(79,70,229,0.7)] transition-all duration-300"
                            >
                                <span className="relative z-10 flex items-center gap-2 tracking-wide">
                                    <Upload className="h-5 w-5" />
                                    UPLOAD PDF
                                </span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1s_ease-in-out]"></div>
                            </button>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                            <Shield className="h-3 w-3" />
                            <span>Zero-Knowledge Architecture</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
