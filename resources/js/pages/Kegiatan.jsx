import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import Calendar from '../components/Calendar';
import ActivityForm from '../components/ActivityForm';
import WibClockCard from '../components/WibClockCard';
import { motion } from 'framer-motion';
import AppShell from '../components/AppShell';

export default function Kegiatan() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const formatWIB = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '';
        const parts = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const map = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
        return `${map.day} ${map.month} ${map.year} ${map.hour}:${map.minute}:${map.second} WIB`;
    };

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/activities?date=${formattedDate}`);
            setActivities(res.data);
        } catch (error) {
            if (error.response?.status !== 401) toast.error('Gagal memuat kegiatan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [formattedDate]);

    const sorted = useMemo(() => {
        return [...activities].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '') || String(a.id).localeCompare(String(b.id)));
    }, [activities]);

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const openCreate = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const openEdit = (a) => {
        setEditing(a);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        try {
            if (editing?.id) {
                await axios.put(`/api/activities/${editing.id}`, { ...data, date: formattedDate });
                toast.success('Kegiatan diperbarui');
            } else {
                await axios.post('/api/activities', { ...data, date: formattedDate });
                toast.success('Kegiatan ditambahkan');
            }
            setIsModalOpen(false);
            setEditing(null);
            fetchActivities();
        } catch (error) {
            const msg = Object.values(error.response?.data?.errors || {}).flat()[0] || 'Gagal menyimpan kegiatan';
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus kegiatan ini?')) return;
        try {
            await axios.delete(`/api/activities/${id}`);
            toast.success('Kegiatan dihapus');
            fetchActivities();
        } catch (error) {
            toast.error('Gagal menghapus kegiatan');
        }
    };

    const setCompleted = async (activity, completed) => {
        const prev = activities;
        setActivities(cur => cur.map(a => a.id === activity.id ? { ...a, completed_at: completed ? new Date().toISOString() : null } : a));
        try {
            const res = await axios.patch(`/api/activities/${activity.id}/completed`, { completed });
            setActivities(cur => cur.map(a => a.id === activity.id ? res.data : a));
        } catch (error) {
            setActivities(prev);
            toast.error('Gagal mengubah status kegiatan');
        }
    };

    const getStatus = (a) => {
        if (a.completed_at) return 'done';
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const activityDate = new Date(`${a.date}T00:00:00`);
        if (activityDate < todayDate) return 'missed';
        if (activityDate > todayDate) return 'pending';
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        const [eh, em] = String(a.end_time || '00:00').split(':').map(n => parseInt(n, 10));
        const endMinutes = (eh || 0) * 60 + (em || 0);
        if (nowMinutes > endMinutes) return 'missed';
        return 'pending';
    };

    const activitiesByHour = useMemo(() => {
        const map = new Map();
        hours.forEach(h => map.set(h, []));
        sorted.forEach(a => {
            const [sh, sm] = String(a.start_time || '00:00').split(':').map(n => parseInt(n, 10));
            const [eh, em] = String(a.end_time || '00:00').split(':').map(n => parseInt(n, 10));

            const startHour = Number.isFinite(sh) ? sh : 0;
            const endHour = Number.isFinite(eh) ? eh : startHour;

            const clampedStart = Math.min(23, Math.max(0, startHour));
            const clampedEnd = Math.min(23, Math.max(0, endHour));

            const from = Math.min(clampedStart, clampedEnd);
            const to = Math.max(clampedStart, clampedEnd);

            for (let h = from; h <= to; h += 1) {
                if (map.has(h)) map.get(h).push(a);
            }
        });
        return map;
    }, [sorted, hours]);

    return (
        <AppShell
            title="Kelola Kegiatan"
            subtitle="Jadwal 24 jam, ceklis selesai, dan tanda tidak dikerjakan otomatis."
            right={
                <button
                    onClick={openCreate}
                    className="px-4 py-2 rounded-2xl text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow transition-transform active:scale-[0.98]"
                >
                    + Tambah Kegiatan
                </button>
            }
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="xl:col-span-4 space-y-6"
                >
                    <div className="mm-elevate rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <div className="text-sm font-bold text-slate-100">Kalender</div>
                            <div className="text-xs text-slate-400 mt-1">{format(selectedDate, 'd MMMM yyyy')}</div>
                        </div>
                        <div className="p-4">
                            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                        </div>
                    </div>

                    <WibClockCard
                        city="Jakarta"
                        allowBackgroundUpload
                        className="select-none"
                    />
                </motion.div>

                <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="xl:col-span-8"
                >
                    <div className="mm-elevate rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)] overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-100">Jadwal 24 Jam</div>
                                <div className="text-xs text-slate-400 mt-1">{sorted.length} kegiatan</div>
                            </div>
                            <div className="text-xs text-slate-400">Centang untuk selesai, lewat jam jadi merah.</div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {hours.map(h => (
                                    <div key={h} className="flex gap-4 px-5 py-4">
                                        <div className="w-16 shrink-0 text-sm text-slate-300 pt-1">
                                            {String(h).padStart(2, '0')}:00
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {activitiesByHour.get(h).length === 0 ? (
                                                <div className="text-sm text-slate-500 select-none">-</div>
                                            ) : (
                                                activitiesByHour.get(h).map(a => (
                                                    (() => {
                                                        const status = getStatus(a);
                                                        const checked = Boolean(a.completed_at);
                                                        const badgeText = status === 'done' ? 'Selesai' : status === 'missed' ? 'Tidak dikerjakan' : 'Belum';
                                                        const badgeClass = status === 'done'
                                                            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-700/40'
                                                            : status === 'missed'
                                                                ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-700/40'
                                                                : 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-700/40';
                                                        return (
                                                            <div
                                                                key={`${a.id}-${h}`}
                                                                className="flex items-start justify-between gap-3 p-3 rounded-2xl ring-1 ring-white/10 bg-black/25 hover:bg-black/35 transition-colors"
                                                            >
                                                                <div className="min-w-0 flex gap-3">
                                                                    <label className="pt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) => setCompleted(a, e.target.checked)}
                                                                            className="h-5 w-5 accent-emerald-500"
                                                                        />
                                                                    </label>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className={clsx("text-sm font-semibold", checked ? "text-slate-300 line-through" : "text-slate-100")}>{a.title}</span>
                                                                            <span className="text-xs text-slate-400">{String(a.start_time).slice(0, 5)}–{String(a.end_time).slice(0, 5)}</span>
                                                                            <span className={clsx("text-[11px] px-2 py-0.5 rounded-full", badgeClass)}>{badgeText}</span>
                                                                        </div>
                                                                        {a.notes ? <div className="text-xs text-slate-400 mt-1 break-words">{a.notes}</div> : null}
                                                                        <div className="text-[11px] text-slate-500 mt-1">
                                                                            Update: {formatWIB(a.updated_at || a.created_at)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => openEdit(a)}
                                                                        className="text-slate-300 hover:text-cyan-300 p-2 rounded-xl hover:bg-white/5"
                                                                    >
                                                                        <PencilSquareIcon className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(a.id)}
                                                                        className="text-slate-300 hover:text-rose-300 p-2 rounded-xl hover:bg-white/5"
                                                                    >
                                                                        <TrashIcon className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <ActivityForm
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditing(null); }}
                onSubmit={handleSubmit}
                initialValue={editing}
            />
        </AppShell>
    );
}
