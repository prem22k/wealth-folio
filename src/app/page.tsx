'use client';

import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";
import UnsealDashboard from "@/components/dashboard/UnsealDashboard";

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
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium">Securing Vault...</p>
      </div>
    );
  }

  return (
    <UnsealDashboard
      user={user}
      balance={Number(netBalance)}
      transactions={transactions}
      stats={{
        income: Number(totalIncome),
        expense: Number(totalExpense)
      }}
    />
  );
}