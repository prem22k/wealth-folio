'use client';

import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import VerificationBoard from '@/components/verification/VerificationBoard';

export default function VerifyPage() {
    return (
        <DashboardShell headerTitle="Data Hygiene">
            <div className="flex flex-col h-full gap-6">
                <div>
                    <h1 className="text-white text-3xl font-bold leading-tight">Transaction Hygiene</h1>
                    <p className="text-slate-400">Classify 12 pending transactions to maintain vault integrity.</p>
                </div>

                <VerificationBoard />
            </div>
        </DashboardShell>
    );
}
