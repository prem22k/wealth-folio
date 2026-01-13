'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { processStatement } from '@/app/actions/upload-statement';
import { ParsedTransaction } from '@/lib/parsers/sbi';
import { toRupees } from '@/types/schema';

export default function StatementUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState<ParsedTransaction[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setError(null);
        setIsUploading(true);
        setPreviewData(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await processStatement(formData);

            if (result.success && result.data) {
                setPreviewData(result.data);
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
    }, []);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleReset = () => {
        setPreviewData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirm = () => {
        console.log('Confirmed Transactions:', previewData);
        // Future: Submit to Firestore batch write
        alert(`Confirmed ${previewData?.length} transactions! (Logged to console)`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Statement Upload
                </h2>
                {previewData && (
                    <button
                        onClick={handleReset}
                        className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Upload New
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {!previewData ? (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragging
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                        }
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={onFileSelect}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-slate-400 font-medium">Processing Statement...</p>
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
            ) : (
                <div className="space-y-6">
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800 text-slate-200 uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {previewData.map((txn, index) => (
                                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {/* 
                           txn.date could be a Date object (if component wraps client-side) 
                           but server actions return JSON, so Dates become strings.
                        */}
                                            {new Date(txn.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 max-w-md truncate" title={txn.description}>
                                            {txn.description}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                        ${txn.type === 'income' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {txn.type === 'income' ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-medium ${txn.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                                            {toRupees(txn.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Check className="h-4 w-4" />
                            Confirm & Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
