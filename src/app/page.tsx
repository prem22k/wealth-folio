'use client';

import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import QuickAddTransaction from "@/components/forms/QuickAddTransaction";
import StatementUploader from "@/components/dashboard/StatementUploader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { TrendingUp, Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    netBalance
  } = useTransactions(user?.uid);

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-full text-blue-500">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">WealthFolio</h1>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Top Row: Summary Cards */}
        <SummaryCards
          income={Number(totalIncome)}
          expense={Number(totalExpense)}
          balance={Number(netBalance)}
        />

        {/* Middle Row: Statement Uploader */}
        <StatementUploader />

        {/* Bottom Grid: Transaction Data & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Recent Activity */}
          <div className="h-full">
            <RecentTransactions transactions={transactions} />
          </div>

          {/* Column 2: Expense Analysis */}
          <div className="h-full">
            <CategoryChart transactions={transactions} />
          </div>

          {/* Column 3: Quick Add */}
          <div className="h-full">
            <QuickAddTransaction />
          </div>
        </div>
      </div>
    </main>
  );
}