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

    const nav = [
        { to: '/keuangan', label: 'Keuangan', icon: CreditCardIcon },
        { to: '/kegiatan', label: 'Kegiatan', icon: CalendarDaysIcon },
        { to: '/kendaraan', label: 'Kendaraan', icon: TruckIcon },
    ];

    return (
        <div className="mc-world">
            <div className="mc-overlay" style={{ zIndex: 0 }} />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                    <aside className="mm-elevate lg:sticky lg:top-6 h-fit mc-panel overflow-hidden">
                        <div className="p-5 border-b border-black/50">
                            <div className="flex items-center justify-between gap-3">
                                <Link to="/keuangan" className="text-lg font-black mc-title">
                                    MoneyM
                                </Link>
                                <span className="mc-chip text-[11px] font-extrabold tracking-wide">WORLD 1-1</span>
                            </div>
                            <div className="mt-3">
                                <div className="text-sm font-extrabold mc-title truncate">{user?.name}</div>
                                <div className="text-xs mc-muted truncate">{user?.username || user?.email}</div>
                            </div>
                        </div>

                        <nav className="p-2 space-y-2">
                            {nav.map((n) => {
                                const Icon = n.icon;
                                const isActive = path === n.to;
                                return (
                                    <Link
                                        key={n.to}
                                        to={n.to}
                                        className={clsx(
                                            "group flex items-center gap-3 px-3 py-3 rounded-md border-2 transition-transform",
                                            isActive
                                                ? "bg-black/25 border-black/60"
                                                : "bg-black/15 border-black/40 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0"
                                        )}
                                    >
                                        <span className="flex items-center justify-center w-9 h-9 rounded-md bg-black/25 border-2 border-black/60 group-hover:brightness-110">
                                            <Icon className="w-5 h-5 text-white/90" />
                                        </span>
                                        <span className={clsx("font-extrabold tracking-wide", isActive ? "mc-title" : "text-white/85")}>
                                            {n.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-black/50">
                            <button
                                onClick={logout}
                                className="w-full mc-btn mc-btn-red"
                            >
                                Logout
                            </button>
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <header className="mm-elevate mc-panel overflow-hidden">
                            <div className="p-6 sm:p-7 flex items-start justify-between gap-4 flex-wrap">
                                <div className="min-w-0">
                                    <div className="text-2xl sm:text-3xl font-black mc-title">
                                        {title}
                                    </div>
                                    {subtitle ? <div className="mt-1 text-sm mc-muted">{subtitle}</div> : null}
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
