'use client';

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import UnsealVault from "@/components/dashboard/UnsealVault";

export default function VaultPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#020205] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-400 font-medium">Securing Environment...</p>
            </div>
        );
    }

    return (
        <DashboardShell showSecureBadge={false} className="flex flex-col items-center justify-center">
            <UnsealVault />
        </DashboardShell>
    );
}
