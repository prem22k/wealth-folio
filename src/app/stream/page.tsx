'use client';

import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";
import UnsealStream from "@/components/dashboard/UnsealStream";

export default function StreamPage() {
    const { user } = useAuth();
    const {
        transactions,
        loading
    } = useTransactions(user?.uid);

    if (loading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-400 font-medium">Loading Stream...</p>
            </div>
        );
    }

    return (
        <UnsealStream
            user={user}
            transactions={transactions}
        />
    );
}
