import React from 'react';
import { format } from 'date-fns';

export default function WeeklyTrend({ data = [] }) {
    if (!data.length) {
        return (
            <div className="p-5 mc-panel text-white/85">
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
        <div className="p-5 mc-panel">
            <div className="flex justify-between items-center mb-2">
                <p className="font-black mc-title">Tren Mingguan</p>
                <span className={trendUp ? "text-emerald-200 font-black" : "text-rose-200 font-black"}>
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
                        <stop offset="0%" stopColor="#ff3a3a" />
                        <stop offset="50%" stopColor="#ffd34d" />
                        <stop offset="100%" stopColor="#246ad0" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="mt-2 text-xs mc-muted flex justify-between">
                <span>{format(new Date(data[0].date), 'd MMM')}</span>
                <span>{format(new Date(last.date), 'd MMM')}</span>
            </div>
        </div>
    );
}
