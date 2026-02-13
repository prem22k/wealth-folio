'use client';

import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {

    // Mock Data for Sunburst (Nested Pie)
    const data01 = [
        { name: 'Essentials', value: 400 },
        { name: 'Lifestyle', value: 300 },
        { name: 'Savings', value: 300 },
        { name: 'Debt', value: 200 },
    ];
    const data02 = [
        { name: 'Housing', value: 200 },
        { name: 'Food', value: 200 },
        { name: 'Travel', value: 100 },
        { name: 'Ent.', value: 100 },
        { name: 'Shopping', value: 100 },
        { name: 'Invest', value: 200 },
        { name: 'Cash', value: 100 },
    ];

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];

    // Mock Data for Bar Chart
    const barData = [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Apr', income: 2780, expense: 3908 },
        { name: 'May', income: 1890, expense: 4800 },
        { name: 'Jun', income: 2390, expense: 3800 },
    ];

    return (
        <DashboardShell headerTitle="Analytics">
            <div className="flex flex-col gap-8 w-full">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-white text-3xl font-bold leading-tight">Visual Intelligence</h1>
                    <p className="text-slate-400">Deep dive into your financial entropy.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sunburst Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col"
                    >
                        <h3 className="text-white font-bold mb-4">Spend Composition</h3>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data01} dataKey="value" cx="50%" cy="50%" outerRadius={60} fill="#4f46e5" stroke="#1e293b" />
                                    <Pie data={data02} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#818cf8" label stroke="#1e293b">
                                        {data02.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col"
                    >
                        <h3 className="text-white font-bold mb-4">Cash Flow Velocity</h3>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                                    />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardShell>
    );
}
