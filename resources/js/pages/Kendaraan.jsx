import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import VehicleForm from '../components/VehicleForm';
import AppShell from '../components/AppShell';

export default function Kendaraan() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [openMaintenance, setOpenMaintenance] = useState({});
    const [maintenanceByVehicle, setMaintenanceByVehicle] = useState({});
    const [maintenanceLoading, setMaintenanceLoading] = useState({});

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/vehicles');
            setVehicles(res.data);
        } catch (error) {
            if (error.response?.status !== 401) toast.error('Gagal memuat kendaraan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const openEdit = (v) => {
        setEditing(v);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editing?.id) {
                const res = await axios.put(`/api/vehicles/${editing.id}`, {
                    ...data,
                    oil_interval_km: Number(data.oil_interval_km),
                    current_km: Number(data.current_km),
                    last_oil_change_km: Number(data.last_oil_change_km ?? data.current_km),
                });
                setVehicles(cur => cur.map(v => v.id === editing.id ? res.data : v));
                toast.success('Kendaraan diperbarui');
            } else {
                const res = await axios.post('/api/vehicles', data);
                setVehicles(cur => [res.data, ...cur]);
                toast.success('Kendaraan ditambahkan');
            }
            setIsModalOpen(false);
            setEditing(null);
        } catch (error) {
            const msg = Object.values(error.response?.data?.errors || {}).flat()[0] || 'Gagal menyimpan kendaraan';
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kendaraan ini?')) return;
        try {
            await axios.delete(`/api/vehicles/${id}`);
            setVehicles(cur => cur.filter(v => v.id !== id));
            toast.success('Kendaraan dihapus');
        } catch (error) {
            toast.error('Gagal menghapus kendaraan');
        }
    };

    const updateKm = async (v) => {
        const input = prompt(`Update KM untuk ${v.brand} ${v.model} (${v.year})`, String(v.current_km ?? 0));
        if (input == null) return;
        const next = Number(input);
        if (!Number.isFinite(next) || next < 0) {
            toast.error('KM tidak valid');
            return;
        }
        try {
            const res = await axios.patch(`/api/vehicles/${v.id}/km`, { current_km: Math.floor(next) });
            setVehicles(cur => cur.map(x => x.id === v.id ? res.data : x));
            if (res.data.oil_due) toast('Silahkan ganti oli nya.', { icon: '🛢️' });
            else toast.success('KM diperbarui');
        } catch (error) {
            const msg = Object.values(error.response?.data?.errors || {}).flat()[0] || 'Gagal update KM';
            toast.error(msg);
        }
    };

    const markOilChanged = async (v) => {
        if (!confirm('Tandai sudah ganti oli sekarang?')) return;
        try {
            const res = await axios.post(`/api/vehicles/${v.id}/oil-change`);
            setVehicles(cur => cur.map(x => x.id === v.id ? res.data : x));
            toast.success('Tersimpan: sudah ganti oli');
        } catch (error) {
            toast.error('Gagal menyimpan ganti oli');
        }
    };

    const toggleMaintenance = async (v) => {
        const isOpen = Boolean(openMaintenance[v.id]);
        if (isOpen) {
            setOpenMaintenance(cur => ({ ...cur, [v.id]: false }));
            return;
        }
        setOpenMaintenance(cur => ({ ...cur, [v.id]: true }));
        if (maintenanceByVehicle[v.id]) return;
        setMaintenanceLoading(cur => ({ ...cur, [v.id]: true }));
        try {
            const res = await axios.get(`/api/vehicles/${v.id}/maintenance`);
            setMaintenanceByVehicle(cur => ({ ...cur, [v.id]: res.data }));
        } catch (error) {
            toast.error('Gagal memuat daftar perawatan');
        } finally {
            setMaintenanceLoading(cur => ({ ...cur, [v.id]: false }));
        }
    };

    const markMaintenanceDone = async (vehicleId, maintenanceId) => {
        try {
            await axios.post(`/api/vehicles/${vehicleId}/maintenance/${maintenanceId}/done`);
            const res = await axios.get(`/api/vehicles/${vehicleId}/maintenance`);
            setMaintenanceByVehicle(cur => ({ ...cur, [vehicleId]: res.data }));
            toast.success('Tersimpan: sudah diganti');
        } catch (error) {
            toast.error('Gagal menyimpan perawatan');
        }
    };

    const updateMaintenanceInterval = async (vehicleId, maintenanceId, prevInterval) => {
        const input = prompt('Ubah interval (KM)', String(prevInterval ?? ''));
        if (input == null) return;
        const next = Number(input);
        if (!Number.isFinite(next) || next < 500) {
            toast.error('Interval tidak valid');
            return;
        }
        try {
            await axios.patch(`/api/vehicles/${vehicleId}/maintenance/${maintenanceId}`, { interval_km: Math.floor(next) });
            const res = await axios.get(`/api/vehicles/${vehicleId}/maintenance`);
            setMaintenanceByVehicle(cur => ({ ...cur, [vehicleId]: res.data }));
            toast.success('Interval diperbarui');
        } catch (error) {
            const msg = Object.values(error.response?.data?.errors || {}).flat()[0] || 'Gagal update interval';
            toast.error(msg);
        }
    };

    const toggleMaintenanceEnabled = async (vehicleId, maintenanceId, enabled) => {
        try {
            await axios.patch(`/api/vehicles/${vehicleId}/maintenance/${maintenanceId}`, { enabled });
            const res = await axios.get(`/api/vehicles/${vehicleId}/maintenance`);
            setMaintenanceByVehicle(cur => ({ ...cur, [vehicleId]: res.data }));
        } catch (error) {
            toast.error('Gagal mengubah status perawatan');
        }
    };

    const sorted = useMemo(() => {
        return [...vehicles].sort((a, b) => {
            const keyA = `${a.brand}-${a.year}-${a.model}`.toLowerCase();
            const keyB = `${b.brand}-${b.year}-${b.model}`.toLowerCase();
            return keyA.localeCompare(keyB);
        });
    }, [vehicles]);

    return (
        <AppShell
            title="Kelola Kendaraan"
            subtitle="Pantau KM, ganti oli, dan checklist perawatan motor matic."
            right={
                <button
                    onClick={openCreate}
                    className="px-4 py-2 rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow transition-transform active:scale-[0.98]"
                >
                    + Tambah Kendaraan
                </button>
            }
        >
            {loading ? (
                <div className="mm-elevate rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] overflow-hidden">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sorted.length === 0 ? (
                        <div className="mm-elevate p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] text-slate-300">
                            Belum ada kendaraan. Klik “Tambah Kendaraan”.
                        </div>
                    ) : (
                        sorted.map(v => {
                            const progress = v.oil_interval_km > 0 ? Math.min(1, (v.km_since_oil || 0) / v.oil_interval_km) : 0;
                            const badgeText = v.oil_due ? 'Silahkan ganti oli nya' : `Sisa ${v.km_remaining_oil} km`;
                            const badgeClass = v.oil_due
                                ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-700/40"
                                : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-700/40";
                            return (
                                <div key={v.id} className="mm-elevate p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] space-y-4">
                                    <div className="flex justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="text-lg font-bold text-slate-100 truncate">{v.brand} {v.model}</div>
                                            <div className="text-sm text-slate-400">Tahun {v.year}</div>
                                        </div>
                                        <span className={clsx("h-fit text-[11px] px-2 py-1 rounded-full whitespace-nowrap", badgeClass)}>
                                            {badgeText}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-2xl ring-1 ring-white/10 bg-black/25">
                                            <div className="text-xs text-slate-400">KM Saat Ini</div>
                                            <div className="text-xl font-bold text-slate-100">{v.current_km}</div>
                                        </div>
                                        <div className="p-3 rounded-2xl ring-1 ring-white/10 bg-black/25">
                                            <div className="text-xs text-slate-400">KM Sejak Ganti Oli</div>
                                            <div className="text-xl font-bold text-slate-100">{v.km_since_oil}</div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl ring-1 ring-white/10 bg-black/25 p-3">
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Interval: {v.oil_interval_km} km</span>
                                            <span>{Math.round(progress * 100)}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={clsx("h-2", v.oil_due ? "bg-rose-500" : "bg-emerald-500")}
                                                style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => updateKm(v)}
                                            className="px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 transition-transform active:scale-[0.98]"
                                        >
                                            Update KM
                                        </button>
                                        <button
                                            onClick={() => markOilChanged(v)}
                                            className="px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 transition-transform active:scale-[0.98]"
                                        >
                                            Sudah Ganti Oli
                                        </button>
                                        <button
                                            onClick={() => toggleMaintenance(v)}
                                            className="px-3 py-2 rounded-2xl text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10 transition-transform active:scale-[0.98]"
                                        >
                                            {openMaintenance[v.id] ? 'Tutup Perawatan' : 'Lihat Perawatan'}
                                        </button>
                                        <button
                                            onClick={() => openEdit(v)}
                                            className="px-3 py-2 rounded-2xl text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10 transition-transform active:scale-[0.98]"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 transition-transform active:scale-[0.98]"
                                        >
                                            Hapus
                                        </button>
                                    </div>

                                    {openMaintenance[v.id] ? (
                                        <div className="pt-2">
                                            <div className="text-sm font-bold text-slate-200 mb-2">Perawatan Motor Matic</div>
                                            {maintenanceLoading[v.id] ? (
                                                <div className="text-sm text-slate-400">Memuat...</div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(maintenanceByVehicle[v.id]?.items || []).map(item => {
                                                        const badgeText = !item.enabled ? 'Nonaktif' : item.due ? 'Wajib ganti' : `Sisa ${item.km_remaining} km`;
                                                        const badgeClass = !item.enabled
                                                            ? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-700/40"
                                                            : item.due
                                                                ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-700/40"
                                                                : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-700/40";
                                                        return (
                                                            <div key={item.id} className="p-3 rounded-2xl ring-1 ring-white/10 bg-black/25 flex justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <div className="font-semibold text-slate-100">{item.name}</div>
                                                                        <span className={clsx("text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap", badgeClass)}>
                                                                            {badgeText}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 mt-1">
                                                                        Interval {item.interval_km} km • Terakhir di KM {item.last_service_km} • Jalan {item.km_since_service} km
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => markMaintenanceDone(v.id, item.id)}
                                                                        className="px-3 py-2 rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600"
                                                                    >
                                                                        Tandai Diganti
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateMaintenanceInterval(v.id, item.id, item.interval_km)}
                                                                        className="px-3 py-2 rounded-2xl text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10"
                                                                    >
                                                                        Ubah Interval
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleMaintenanceEnabled(v.id, item.id, !item.enabled)}
                                                                        className="px-3 py-2 rounded-2xl text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10"
                                                                    >
                                                                        {item.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {maintenanceByVehicle[v.id]?.items?.some(i => i.enabled && i.due) ? (
                                                        <div className="text-sm font-semibold text-rose-300">
                                                            Silahkan ganti oli/part yang sudah lewat interval.
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <VehicleForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditing(null); }}
                onSubmit={handleSubmit}
                initialValue={editing}
            />
        </AppShell>
    );
}
