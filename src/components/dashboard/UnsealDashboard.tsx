"use client";

import React from 'react';
import { User } from 'firebase/auth';
import { Transaction } from '@/types/schema';
import { format } from 'date-fns';
import UnsealDock from './UnsealDock';
import UserAvatar from '@/components/ui/UserAvatar';
import FinancialRunwayGauge from './FinancialRunwayGauge';

interface UnsealDashboardProps {
	user: User | null;
	balance: number;
	transactions: Transaction[];
	stats: {
		income: number;
		expense: number;
	};
}

export default function UnsealDashboard({ user, balance, transactions }: UnsealDashboardProps) {
    const firstName = user?.displayName?.split(' ')[0] || 'User';
    const recentTx = transactions.slice(0, 5);
    // Calculate Runway: Balance / fixed 15k for now (as per HTML reference)
    // In a real app, this would be: balance / average_monthly_expense
    const monthlyBurn = 15000;
    const runwayMonths = (balance / 100 / monthlyBurn).toFixed(1);

	return (
		<div className="relative flex min-h-screen w-full flex-col pb-32">
			{/* Header */}
			<header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-20">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-white">
						<span className="material-symbols-outlined text-[20px]">
							lock_open
						</span>
					</div>
					<h2 className="text-white text-xl font-bold tracking-wider">
						UNSEAL
					</h2>
				</div>
				<div className="flex items-center gap-6">
					<div className="hidden sm:flex items-center gap-2 rounded-full glass-panel px-4 py-1.5">
						<div className="relative flex h-3 w-3">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
						</div>
						<span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
							Secure
						</span>
						<span className="material-symbols-outlined text-emerald-400 text-[18px]">
							shield
						</span>
					</div>
					<div className="glass-panel p-1 rounded-full cursor-pointer hover:border-white/30 transition-colors">
						<UserAvatar />
					</div>
				</div>
			</header>

			{/* Main Content Layout */}
			<main className="flex-1 px-6 md:px-10 lg:px-20 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
				<div className="pt-6 pb-2">
					<h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
						Good evening, {firstName}. <br />
						<span className="text-slate-400 font-normal">
							Your financial fortress is active.
						</span>
					</h1>
				</div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-white">
                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-wider">UNSEAL</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 rounded-full glass-panel px-4 py-1.5">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Secure</span>
                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">shield</span>
                    </div>
                    <div className="glass-panel p-1 rounded-full cursor-pointer hover:border-white/30 transition-colors">
                        <UserAvatar />
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="flex-1 px-6 md:px-10 lg:px-20 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
                <div className="pt-6 pb-2">
                    <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                        Good evening, {firstName}. <br />
                        <span className="text-slate-400 font-normal">Your financial fortress is active.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Runway */}
                    <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[320px] lg:h-auto">
                        <div className="w-full flex justify-start">
                            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Financial Runway</h3>
                        </div>
                        {/* Gauge */}
                        <FinancialRunwayGauge months={runwayMonths} />
                        <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                            <p className="text-slate-300 text-xs font-medium">Based on ₹15k fixed monthly costs</p>
                        </div>
                    </div>

                    {/* CFO Intelligence */}
                    <div className="glass-panel rounded-2xl lg:col-span-2 relative min-h-[320px] flex flex-col items-center justify-center p-8 overflow-hidden group">
                        {/* Shimmer Border/Effect */}
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent z-20">
                            <div className="absolute inset-0 rounded-2xl border border-white/10"></div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

					{/* CFO Intelligence */}
					<div className="glass-panel rounded-2xl lg:col-span-2 relative min-h-[320px] flex flex-col items-center justify-center p-8 overflow-hidden group">
						{/* Shimmer Border/Effect */}
						<div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent z-20">
							<div className="absolute inset-0 rounded-2xl border border-white/10"></div>
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[shimmer_2s_infinite]"></div>
						</div>
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

						<div className="relative z-10 w-full max-w-2xl flex flex-col gap-6 items-center text-center">
							<div className="space-y-2 flex flex-col items-center">
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/20 mb-2">
									<span className="material-symbols-outlined text-[16px]">
										psychology
									</span>
									<span>CFO Intelligence</span>
								</div>
								<h3 className="text-3xl font-bold text-white">
									Ask your personal CFO
								</h3>
								<p className="text-slate-400 max-w-md mx-auto">
									Get instant insights on your spending, investments, and wealth
									leaks.
								</p>
							</div>
							{/* Input */}
							<div className="w-full relative group/input">
								<div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-40 blur group-hover/input:opacity-75 transition duration-500 animate-pulse-slow"></div>
								<div className="relative flex items-center bg-[#0a0a12] rounded-xl px-4 py-4 border border-white/10 shadow-2xl">
									<span className="material-symbols-outlined text-slate-400 mr-3 animate-pulse">
										colors_spark
									</span>
									<input
										className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-slate-500 text-sm md:text-base p-0"
										placeholder="Ask your CFO (e.g., How much did I spend on Swiggy?)"
										type="text"
									/>
									<button
										type="button"
										className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
									>
										<span className="material-symbols-outlined text-[20px]">
											arrow_forward
										</span>
									</button>
								</div>
							</div>
						</div>
					</div>

                    {/* Recent Activity (Added to keep functionality matching new aesthetic) */}
                    <div className="glass-panel rounded-2xl lg:col-span-3 p-8">
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentTx.length === 0 ? (
                                <p className="text-slate-500 text-sm">No recent activity.</p>
                            ) : (
                                recentTx.map((tx, index) => (
                                    <div key={tx.id || `tx-${index}`} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                                                {tx.type === 'income' ? (
                                                    <span className="material-symbols-outlined text-emerald-400 text-[20px] group-hover:text-emerald-300">arrow_downward</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-white">swap_horiz</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{tx.description}</p>
                                                <p className="text-slate-500 text-xs">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                                            </div>
                                        </div>
                                        <span className={`font-medium text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                            {tx.type === 'income' ? '+' : '-'}₹{(tx.amount / 100).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

					{/* Recent Activity (Added to keep functionality matching new aesthetic) */}
					<div className="glass-panel rounded-2xl lg:col-span-3 p-8">
						<h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
							Recent Activity
						</h3>
						<div className="space-y-4">
							{recentTx.length === 0 ? (
								<p className="text-slate-500 text-sm">No recent activity.</p>
							) : (
								recentTx.map((tx, index) => (
									<div
										key={tx.id || index}
										className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5"
									>
										<div className="flex items-center gap-4">
											<div className="size-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
												{tx.type === "income" ? (
													<span className="material-symbols-outlined text-emerald-400 text-[20px] group-hover:text-emerald-300">
														arrow_downward
													</span>
												) : (
													<span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-white">
														swap_horiz
													</span>
												)}
											</div>
											<div>
												<p className="text-white text-sm font-medium">
													{tx.description}
												</p>
												<p className="text-slate-500 text-xs">
													{format(new Date(tx.date), "MMM d, h:mm a")}
												</p>
											</div>
										</div>
										<span
											className={`font-medium text-sm ${tx.type === "income" ? "text-emerald-400" : "text-white"}`}
										>
											{tx.type === "income" ? "+" : "-"}₹
											{(tx.amount / 100).toLocaleString("en-IN")}
										</span>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</main>

			{/* Floating Dock Navigation */}
			<UnsealDock activePath="/" />
		</div>
	);
}
