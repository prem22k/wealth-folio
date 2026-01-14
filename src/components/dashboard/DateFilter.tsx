'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateFilterProps {
    onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

export default function DateFilter({ onDateChange }: DateFilterProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePreset, setActivePreset] = useState<string>('all');

    const handlePreset = (preset: 'thisMonth' | 'last3Months' | 'all') => {
        setActivePreset(preset);
        const now = new Date();
        let start: Date | undefined;
        let end: Date | undefined = now;

        if (preset === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            // End is today
        } else if (preset === 'last3Months') {
            start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        } else {
            // All Time
            start = undefined;
            end = undefined;
        }

        // Update inputs
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');

        onDateChange(start, end);
    };

    const handleCustomDate = (type: 'start' | 'end', value: string) => {
        setActivePreset('custom');
        if (type === 'start') {
            setStartDate(value);
            onDateChange(value ? new Date(value) : undefined, endDate ? new Date(endDate) : undefined);
        } else {
            setEndDate(value);
            onDateChange(startDate ? new Date(startDate) : undefined, value ? new Date(value) : undefined);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button
                    onClick={() => handlePreset('all')}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-colors ${activePreset === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => handlePreset('thisMonth')}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-colors ${activePreset === 'thisMonth'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    This Month
                </button>
                <button
                    onClick={() => handlePreset('last3Months')}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-colors ${activePreset === 'last3Months'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Last 3 Months
                </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleCustomDate('start', e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-200 focus:outline-none w-32 [color-scheme:dark]"
                        placeholder="Start Date"
                    />
                </div>
                <span className="text-slate-500">-</span>
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleCustomDate('end', e.target.value)}
                        className="bg-transparent border-none text-sm text-slate-200 focus:outline-none w-32 [color-scheme:dark]"
                        placeholder="End Date"
                    />
                </div>
            </div>
        </div>
    );
}
