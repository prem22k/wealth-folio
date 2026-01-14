import { Transaction, toRupees } from '@/types/schema';
import { ArrowUp, ArrowDown, Search, Trash2, Trash } from 'lucide-react';
import { cleanDescription, formatCurrency } from '@/lib/formatters';
import { deleteTransaction, clearAllTransactions } from '@/lib/firebase/transactions';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const { user } = useAuth();
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
    const [isClearing, setIsClearing] = useState(false);

    // Filter out locally deleted items, then take top 10
    const recent = transactions
        .filter(t => !deletedIds.has(t.id || ''))
        .slice(0, 10);

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;

        // Optimistic update
        setDeletedIds(prev => new Set(prev).add(id));

        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            // Revert on error
            setDeletedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            alert("Failed to delete transaction.");
        }
    };

    const handleClearHistory = async () => {
        if (!user?.uid) return;

        if (window.confirm('Are you sure you want to delete ALL your transaction history? This cannot be undone.')) {
            setIsClearing(true);
            try {
                const count = await clearAllTransactions(user.uid);
                alert(`Successfully cleared ${count} transactions.`);
                // We rely on the real-time listener to clear the list, 
                // but we can also set a flag if needed. 
                // Since it's all of them, the parent hook will return [] soon.
            } catch (error) {
                console.error("Failed to clear history:", error);
                alert("Failed to clear history.");
            } finally {
                setIsClearing(false);
            }
        }
    };

    if (recent.length === 0 && transactions.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-800 rounded-full mb-4">
                    <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-200">No activity yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                    Your recent transactions will appear here once you start adding them.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full relative">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">Recent Activity</h2>
                {transactions.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        disabled={isClearing}
                        className="text-xs text-red-500 hover:text-red-400 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                        {isClearing ? 'Clearing...' : (
                            <>
                                <Trash2 size={12} />
                                Clear History
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {recent.map((txn) => (
                    <div key={txn.id || Math.random()} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4 overflow-hidden">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg shrink-0 ${txn.type === 'income'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                                }`}>
                                {txn.type === 'income' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </div>

                            {/* Description & Date */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-slate-200 font-medium truncate">
                                    {cleanDescription(txn.description)}
                                </span>
                                <span className="text-xs text-slate-500 truncate" title={txn.description}>
                                    {new Date(txn.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short'
                                    })} • {txn.description.substring(0, 20)}...
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            {/* Amount */}
                            <div className={`font-semibold ${txn.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                                }`}>
                                {txn.type === 'income' ? '+' : '-'} {formatCurrency(toRupees(txn.amount))}
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(txn.id)}
                                className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete transaction"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
