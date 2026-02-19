import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Calendar from '../components/Calendar';
import DailyDashboard from '../components/DailyDashboard';
import TransactionForm from '../components/TransactionForm';
import { motion } from 'framer-motion';
import WeeklyTrend from '../components/WeeklyTrend';
import AppShell from '../components/AppShell';

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState({ opening_balance: 0, total_in: 0, total_out: 0, closing_balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trend, setTrend] = useState([]);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, transactionsRes] = await Promise.all([
                axios.get(`/api/daily-summary?date=${formattedDate}`),
                axios.get(`/api/transactions?date=${formattedDate}`)
            ]);
            setSummary(summaryRes.data);
            setTransactions(transactionsRes.data);
            const start = format(new Date(selectedDate.getTime() - 13 * 24 * 3600 * 1000), 'yyyy-MM-dd');
            const trendRes = await axios.get(`/api/summary-range?start=${start}&end=${formattedDate}`);
            setTrend(trendRes.data);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Gagal memuat data. Periksa koneksi internet.');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [formattedDate]);

    const handleAddTransaction = async (data) => {
        try {
            await axios.post('/api/transactions', {
                ...data,
                date: formattedDate
            });
            toast.success('Transaksi berhasil disimpan');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan transaksi');
            console.error(error);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
        try {
            await axios.delete(`/api/transactions/${id}`);
            toast.success('Transaksi dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus transaksi');
            console.error(error);
        }
    };

    return (
        <AppShell
            title="Kelola Keuangan"
            subtitle="Catat transaksi harian, pantau saldo, dan export laporan."
            right={
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mc-btn mc-btn-blue"
                >
                    + Tambah Transaksi
                </button>
            }
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="xl:col-span-4 space-y-6"
                >
                    <div className="mm-elevate mc-panel overflow-hidden">
                        <div className="p-5 border-b border-black/50">
                            <div className="text-sm font-black mc-title">Kalender</div>
                            <div className="text-xs mc-muted mt-1">Pilih tanggal untuk transaksi hari itu.</div>
                        </div>
                        <div className="p-4">
                            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                        </div>
                    </div>

                    <div className="mm-elevate mc-panel overflow-hidden">
                        <div className="p-6">
                            <div className="text-sm font-black mc-title">Tips</div>
                            <div className="mt-2 text-sm mc-muted">Cukup konsisten 5 menit per hari untuk catat pemasukan/pengeluaran.</div>
                        </div>
                    </div>

                    <WeeklyTrend data={trend} />
                </motion.div>

                <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="xl:col-span-8"
                >
                    <div className="mm-elevate mc-panel overflow-hidden">
                        <div className="p-5 border-b border-black/50 flex items-center justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                                <div className="text-sm font-black mc-title">Ringkasan & Transaksi</div>
                                <div className="text-xs mc-muted mt-1">{format(selectedDate, 'd MMMM yyyy')}</div>
                            </div>
                            <div className="text-xs mc-muted">Cari, filter, dan export CSV.</div>
                        </div>

                        <div className="p-5">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white/80"></div>
                                </div>
                            ) : (
                                <DailyDashboard
                                    date={selectedDate}
                                    summary={summary}
                                    transactions={transactions}
                                    onDelete={handleDeleteTransaction}
                                    onAdd={() => setIsModalOpen(true)}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <TransactionForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddTransaction}
            />
        </AppShell>
    );
}
