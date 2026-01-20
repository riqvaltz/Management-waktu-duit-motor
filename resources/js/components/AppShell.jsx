import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { CalendarDaysIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppShell({ title, subtitle, right, children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    const [accent, setAccent] = React.useState(() => {
        try {
            return localStorage.getItem('accent') || 'neon';
        } catch (e) {
            return 'neon';
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem('accent', accent);
        } catch (e) {
            // ignore
        }
    }, [accent]);

    const nav = [
        { to: '/keuangan', label: 'Keuangan', icon: CreditCardIcon },
        { to: '/kegiatan', label: 'Kegiatan', icon: CalendarDaysIcon },
        { to: '/kendaraan', label: 'Kendaraan', icon: TruckIcon },
    ];

    const activeGlow = accent === 'emerald'
        ? 'bg-gradient-to-r from-emerald-500/15 via-teal-400/10 to-transparent'
        : 'bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/10 to-transparent';

    const activeRing = accent === 'emerald'
        ? 'ring-1 ring-emerald-400/25'
        : 'ring-1 ring-cyan-400/25';

    const [spot, setSpot] = React.useState({ x: 0, y: 0, ready: false });
    React.useEffect(() => {
        let raf = 0;
        const onMove = (e) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                setSpot({ x: e.clientX, y: e.clientY, ready: true });
            });
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
        };
    }, []);

    return (
        <div className="min-h-screen text-slate-100 bg-[#05060a]">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_60%_20%,rgba(168,85,247,0.12),transparent_50%),radial-gradient(circle_at_90%_90%,rgba(34,197,94,0.10),transparent_50%)]"></div>
                <motion.div
                    className="mm-blob absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-25"
                    style={{ background: 'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.9), rgba(56,189,248,0) 65%)' }}
                />
                <motion.div
                    className="mm-blob mm-blob-slow absolute top-24 right-0 h-96 w-96 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.9), rgba(168,85,247,0) 65%)' }}
                />
                <motion.div
                    className="mm-blob absolute bottom-0 left-1/3 h-[520px] w-[520px] rounded-full blur-3xl opacity-15"
                    style={{ background: 'radial-gradient(circle at 40% 40%, rgba(34,197,94,0.9), rgba(34,197,94,0) 70%)' }}
                />
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(transparent_0,transparent_12px,rgba(255,255,255,0.12)_13px),linear-gradient(90deg,transparent_0,transparent_12px,rgba(255,255,255,0.12)_13px)] bg-[size:13px_13px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/75"></div>
                <div className="mm-scanlines absolute inset-0"></div>
                <div
                    className="absolute inset-0"
                    style={{
                        opacity: spot.ready ? 1 : 0,
                        transition: 'opacity 300ms ease',
                        background: `radial-gradient(500px circle at ${spot.x}px ${spot.y}px, rgba(56,189,248,0.14), transparent 45%)`,
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                    <aside className="mm-elevate lg:sticky lg:top-6 h-fit rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_90px_-50px_rgba(0,0,0,0.9)] overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <div className="flex items-center justify-between gap-3">
                                <Link to="/keuangan" className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-400">
                                    MoneyM
                                </Link>
                                <select
                                    value={accent}
                                    onChange={(e) => setAccent(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-white/10 bg-black/30 text-slate-100 text-xs"
                                >
                                    <option value="neon">Neon</option>
                                    <option value="emerald">Emerald</option>
                                </select>
                            </div>
                            <div className="mt-3">
                                <div className="text-sm font-semibold text-slate-100 truncate">{user?.name}</div>
                                <div className="text-xs text-slate-400 truncate">{user?.username || user?.email}</div>
                            </div>
                        </div>

                        <nav className="p-2 space-y-1">
                            {nav.map((n) => {
                                const Icon = n.icon;
                                const isActive = path === n.to;
                                return (
                                    <Link
                                        key={n.to}
                                        to={n.to}
                                        className={clsx(
                                            "group relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
                                            isActive ? "text-slate-100" : "text-slate-300 hover:text-slate-100 hover:bg-white/5"
                                        )}
                                    >
                                        {isActive ? <span className={clsx("absolute inset-0 rounded-2xl", activeGlow)} /> : null}
                                        {isActive ? <span className={clsx("absolute inset-0 rounded-2xl", activeRing)} /> : null}
                                        <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-black/30 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.06]">
                                            <Icon className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-3" />
                                        </span>
                                        <span className="relative font-semibold">{n.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={logout}
                                className="w-full px-4 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 shadow transition-transform active:scale-[0.98]"
                            >
                                Logout
                            </button>
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <header className="mm-elevate relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_90px_-55px_rgba(0,0,0,0.9)] overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 mm-shimmer opacity-35"></div>
                            <div className="p-6 sm:p-7 flex items-start justify-between gap-4 flex-wrap">
                                <div className="min-w-0">
                                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-400">
                                        {title}
                                    </div>
                                    {subtitle ? <div className="mt-1 text-sm text-slate-300">{subtitle}</div> : null}
                                </div>
                                {right ? <div className="shrink-0">{right}</div> : null}
                            </div>
                        </header>

                        <div className="mt-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={path}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
