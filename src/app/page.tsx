'use client';

import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";
import UnsealDashboard from "@/components/dashboard/UnsealDashboard";
import LandingPage from "@/components/landing/LandingPage";

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  // Note: useTransactions might be nullish safe, let's check or handle it
  // But fundamentally, if !user, we should show LandingPage.
  // We can't conditionally call hooks easily in React (Rules of Hooks).
  // So we call hooks always, but pass user?.uid which might be undefined.
  // The hook should handle undefined uid.

  const {
    transactions,
    loading: txLoading,
    totalIncome,
    totalExpense,
    netBalance
  } = useTransactions(user?.uid || '');

  // If Auth is loading, show spinner (or AuthGuard handles it, but here we can handle it too)
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium">Securing Vault...</p>
      </div>
    );
  }

  // If no user, show Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // If user exists but transactions loading? Original code showed spinner only on auth loading.
  // Let's keep txLoading if we want, or just pass to dashboard.
  // The original component might handle loading or empty states. 
  // For better UX, let's show dashboard even if tx loading? 
  // Actually, dashboard expects transactions. 

  if (txLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 font-medium">Decrypting Ledger...</p>
      </div>
    )
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