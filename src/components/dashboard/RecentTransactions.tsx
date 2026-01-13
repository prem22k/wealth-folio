import { Transaction, toRupees } from '@/types/schema';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    // Take only the first 10 transactions
    const recent = transactions.slice(0, 10);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    if (recent.length === 0) {
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Recent Activity</h2>

            <div className="space-y-4">
                {recent.map((txn) => (
                    <div key={txn.id || Math.random()} className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${txn.type === 'income'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                {txn.type === 'income' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </div>

                            {/* Description & Date */}
                            <div className="flex flex-col">
                                <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                                    {txn.description}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(txn.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className={`font-semibold ${txn.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                            }`}>
                            {txn.type === 'income' ? '+' : '-'} {formatCurrency(toRupees(txn.amount))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
