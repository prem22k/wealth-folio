import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
    income: number;
    expense: number;
    balance: number;
}

export default function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <div className="p-6 bg-blue-900/20 border border-blue-900/50 rounded-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Total Balance</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        {formatCurrency(balance)}
                    </h3>
                </div>
                {/* Decorative blob */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
            </div>

            {/* Income Card */}
            <div className="p-6 bg-emerald-900/20 border border-emerald-900/50 rounded-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Total Income</span>
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-400 tracking-tight">
                        {formatCurrency(income)}
                    </h3>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            </div>

            {/* Expense Card */}
            <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <ArrowDownRight className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Total Expenses</span>
                    </div>
                    <h3 className="text-3xl font-bold text-red-400 tracking-tight">
                        {formatCurrency(expense)}
                    </h3>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
            </div>
        </div>
    );
}
