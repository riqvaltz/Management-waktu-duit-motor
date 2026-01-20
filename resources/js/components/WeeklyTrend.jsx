import React from 'react';
import { format } from 'date-fns';

export default function WeeklyTrend({ data = [] }) {
    if (!data.length) {
        return (
            <div className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] text-slate-300">
                Tidak ada data tren.
            </div>
        );
    }
    const values = data.map(d => d.closing_balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const normalize = v => ((v - min) / (max - min || 1)) * 80 + 10; // y range 10..90
    const width = 240;
    const step = width / (data.length - 1);
    const points = data.map((d, i) => `${i * step},${100 - normalize(d.closing_balance)}`).join(' ');

    const last = data[data.length - 1];
    const diff = last.closing_balance - data[0].closing_balance;
    const trendUp = diff >= 0;

    return (
        <div className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)]">
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-slate-100">Tren Mingguan</p>
                <span className={trendUp ? "text-emerald-400" : "text-rose-400"}>
                    {trendUp ? '▲' : '▼'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Math.abs(diff))}
                </span>
            </div>
            <svg viewBox={`0 0 ${width} 100`} className="w-full h-20">
                <polyline
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="2.5"
                    points={points}
                />
                <defs>
                    <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="mt-2 text-xs text-slate-400 flex justify-between">
                <span>{format(new Date(data[0].date), 'd MMM')}</span>
                <span>{format(new Date(last.date), 'd MMM')}</span>
            </div>
        </div>
    );
}
