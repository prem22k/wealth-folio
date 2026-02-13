'use client';

import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { detectSubscriptions } from "@/lib/analysis/subscription-engine";
import { runAnomalyDetection } from "@/lib/analysis/anomaly-engine";
import { Loader2 } from "lucide-react";
import UnsealThreats from "@/components/dashboard/UnsealThreats";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useMemo } from "react";

export default function ThreatsPage() {
    const { user } = useAuth();
    const {
        transactions,
        loading
    } = useTransactions(user?.uid);

    // Compute analysis only when transactions change
    const { subscriptions, anomalies } = useMemo(() => {
        if (!transactions || transactions.length === 0) return { subscriptions: [], anomalies: [] };

        const subs = detectSubscriptions(transactions);
        const anoms = runAnomalyDetection(transactions);

        return { subscriptions: subs, anomalies: anoms };
    }, [transactions]);

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                <p className="text-slate-400 font-medium">Scanning for Threats...</p>
            </div>
        );
    }

    return (
        <DashboardShell showSecureBadge={true} headerTitle="Threat Audit">
            <UnsealThreats
                user={user}
                subscriptions={subscriptions}
                anomalies={anomalies}
            />
        </DashboardShell>
    );
}
