import React from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export default function DailyDashboard({ date, summary, transactions, onDelete, onAdd }) {
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const [q, setQ] = React.useState('');
    const [type, setType] = React.useState('all');
    const filtered = transactions.filter(t => {
        const matchText = (t.description || '').toLowerCase().includes(q.toLowerCase()) || (t.category || '').toLowerCase().includes(q.toLowerCase());
        const matchType = type === 'all' ? true : t.type === type;
        return matchText && matchType;
    });

    const exportCSV = () => {
        const rows = [['Tanggal','Jenis','Kategori','Keterangan','Nominal']];
        filtered.forEach(t => rows.push([
            format(date, 'yyyy-MM-dd'),
            t.type,
            t.category || '',
            t.description || '',
            String(t.amount)
        ]));
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaksi-${format(date,'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [exportingMonthly, setExportingMonthly] = React.useState(false);
    const exportMonthlyCSV = async () => {
        const month = format(date, 'yyyy-MM');
        setExportingMonthly(true);
        try {
            const res = await axios.get(`/api/export/monthly?month=${month}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-${month}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExportingMonthly(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-400">
                    {format(date, 'd MMMM yyyy')}
                </h2>
                <button 
                    onClick={onAdd}
                    className="px-4 py-2 rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow"
                >
                    + Tambah Transaksi
                </button>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Cari</label>
                    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="cari keterangan/kategori..."
                        className="w-full rounded-2xl border border-white/10 bg-black/25 text-slate-100 p-2 focus:border-cyan-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Jenis</label>
                    <select value={type} onChange={e=>setType(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/25 text-slate-100 p-2 focus:border-cyan-500 outline-none">
                        <option value="all">Semua</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                        <option value="initial_balance">Saldo Awal</option>
                    </select>
                </div>
                <div className="shrink-0">
                    <button onClick={exportCSV}
                        className="px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600">
                        Export CSV
                    </button>
                </div>
                <div className="shrink-0">
                    <button
                        onClick={exportMonthlyCSV}
                        disabled={exportingMonthly}
                        className={clsx(
                            "px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600",
                            exportingMonthly && "opacity-60 cursor-not-allowed"
                        )}
                    >
                        {exportingMonthly ? 'Export Bulanan...' : 'Export Bulanan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-3xl ring-1 ring-white/10 bg-black/25">
                    <p className="text-sm text-slate-400">Saldo Awal</p>
                    <p className="text-xl font-bold text-slate-100 truncate" title={formatRupiah(summary.opening_balance)}>{formatRupiah(summary.opening_balance)}</p>
                </div>
                <div className="p-4 rounded-3xl ring-1 ring-emerald-700/40 bg-black/25">
                    <p className="text-sm text-slate-400">Pemasukan</p>
                    <p className="text-xl font-bold text-emerald-400 truncate" title={formatRupiah(summary.total_in)}>{formatRupiah(summary.total_in)}</p>
                </div>
                <div className="p-4 rounded-3xl ring-1 ring-rose-700/40 bg-black/25">
                    <p className="text-sm text-slate-400">Pengeluaran</p>
                    <p className="text-xl font-bold text-rose-400 truncate" title={formatRupiah(summary.total_out)}>{formatRupiah(summary.total_out)}</p>
                </div>
                <div className="p-4 rounded-3xl ring-1 ring-indigo-700/40 bg-black/25">
                    <p className="text-sm text-slate-400">Saldo Akhir</p>
                    <p className="text-xl font-bold text-slate-100 truncate" title={formatRupiah(summary.closing_balance)}>{formatRupiah(summary.closing_balance)}</p>
                </div>
            </div>

            <div className="rounded-3xl overflow-hidden ring-1 ring-white/10 bg-black/20">
                <h3 className="px-5 py-4 font-bold border-b border-white/10 text-slate-200">Riwayat Transaksi</h3>
                {filtered.length === 0 ? (
                    <p className="p-5 text-center text-slate-400">Belum ada transaksi.</p>
                ) : (
                    <ul className="divide-y">
                        {filtered.map(t => (
                            <li key={t.id} className="px-5 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-100">{t.description || 'Tanpa Keterangan'}</p>
                                    <p className="text-xs text-slate-400 capitalize">{t.category ? t.category + ' • ' : ''}{t.type.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={clsx(
                                        "font-bold whitespace-nowrap",
                                        t.type === 'expense' ? "text-rose-400" : "text-emerald-400"
                                    )}>
                                        {t.type === 'expense' ? '-' : '+'} {formatRupiah(Number(t.amount))}
                                    </span>
                                    <button 
                                        onClick={() => onDelete(t.id)}
                                        className="text-slate-300 hover:text-rose-300 p-2 rounded-xl hover:bg-white/5"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
