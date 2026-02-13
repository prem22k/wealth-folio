import React, { useId } from 'react';
import { calculateStrokeDashoffset } from './gauge-utils';

interface FinancialRunwayGaugeProps {
    months: number | string;
}

export default function FinancialRunwayGauge({ months }: FinancialRunwayGaugeProps) {
    const id = useId();
    // Ensure ID is unique and valid for SVG
    const gradientId = `runwayGradient-${id.replace(/:/g, '')}`;
    const numericMonths = Number(months);
    const strokeDashoffset = calculateStrokeDashoffset(numericMonths);

    return (
        <div className="relative flex items-center justify-center size-52 my-4">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="45" stroke="#1e293b" strokeWidth="6"></circle>
                <circle
                    className="drop-shadow-[0_0_10px_rgba(54,35,225,0.5)] transition-all duration-1000 ease-out"
                    cx="50" cy="50" fill="none" r="45"
                    stroke={`url(#${gradientId})`}
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="6"
                ></circle>
                <defs>
                    <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#3623e1"></stop>
                        <stop offset="100%" stopColor="#818cf8"></stop>
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tracking-tight">{months}</span>
                <span className="text-sm text-slate-400 font-medium mt-1">Months</span>
            </div>
        </div>
    );
}
