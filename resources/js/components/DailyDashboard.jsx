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
                <h2 className="text-xl sm:text-2xl font-black mc-title tracking-tight">
                    {format(date, 'd MMMM yyyy')}
                </h2>
                <button 
                    onClick={onAdd}
                    className="mc-btn mc-btn-blue"
                >
                    + Tambah Transaksi
                </button>
            </div>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-xs mc-muted mb-1">Cari</label>
                    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="cari keterangan/kategori..."
                        className="mc-input"/>
                </div>
                <div>
                    <label className="block text-xs mc-muted mb-1">Jenis</label>
                    <select value={type} onChange={e=>setType(e.target.value)}
                        className="mc-input">
                        <option value="all">Semua</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                        <option value="initial_balance">Saldo Awal</option>
                    </select>
                </div>
                <div className="shrink-0">
                    <button onClick={exportCSV}
                        className="mc-btn mc-btn-green">
                        Export CSV
                    </button>
                </div>
                <div className="shrink-0">
                    <button
                        onClick={exportMonthlyCSV}
                        disabled={exportingMonthly}
                        className={clsx(
                            "mc-btn mc-btn-blue",
                            exportingMonthly && "opacity-60 cursor-not-allowed"
                        )}
                    >
                        {exportingMonthly ? 'Export Bulanan...' : 'Export Bulanan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 mc-panel-inner">
                    <p className="text-sm mc-muted">Saldo Awal</p>
                    <p className="text-xl font-black mc-title truncate" title={formatRupiah(summary.opening_balance)}>{formatRupiah(summary.opening_balance)}</p>
                </div>
                <div className="p-4 mc-panel-inner">
                    <p className="text-sm mc-muted">Pemasukan</p>
                    <p className="text-xl font-black text-emerald-200 truncate" title={formatRupiah(summary.total_in)}>{formatRupiah(summary.total_in)}</p>
                </div>
                <div className="p-4 mc-panel-inner">
                    <p className="text-sm mc-muted">Pengeluaran</p>
                    <p className="text-xl font-black text-rose-200 truncate" title={formatRupiah(summary.total_out)}>{formatRupiah(summary.total_out)}</p>
                </div>
                <div className="p-4 mc-panel-inner">
                    <p className="text-sm mc-muted">Saldo Akhir</p>
                    <p className="text-xl font-black mc-title truncate" title={formatRupiah(summary.closing_balance)}>{formatRupiah(summary.closing_balance)}</p>
                </div>
            </div>

            <div className="mc-panel overflow-hidden">
                <h3 className="px-5 py-4 font-black border-b border-black/50 mc-title">Riwayat Transaksi</h3>
                {filtered.length === 0 ? (
                    <p className="p-5 text-center mc-muted">Belum ada transaksi.</p>
                ) : (
                    <ul className="divide-y divide-black/40">
                        {filtered.map(t => (
                            <li key={t.id} className="px-5 py-4 flex justify-between items-center hover:brightness-110 transition-colors">
                                <div>
                                    <p className="font-black mc-title">{t.description || 'Tanpa Keterangan'}</p>
                                    <p className="text-xs mc-muted capitalize">{t.category ? t.category + ' • ' : ''}{t.type.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={clsx(
                                        "font-black whitespace-nowrap",
                                        t.type === 'expense' ? "text-rose-200" : "text-emerald-200"
                                    )}>
                                        {t.type === 'expense' ? '-' : '+'} {formatRupiah(Number(t.amount))}
                                    </span>
                                    <button 
                                        onClick={() => onDelete(t.id)}
                                        className="p-2 rounded-md border-2 border-black/60 bg-black/25 text-white/90 hover:bg-black/35"
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
