import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export default function TopNav({ user, accent, setAccent, onLogout }) {
    const location = useLocation();
    const path = location.pathname;

    const linkClass = (to) => clsx(
        "px-3 py-2 rounded-md text-sm font-black transition-colors border-2",
        path === to ? "bg-black/25 border-black/60 mc-title" : "text-white/85 bg-black/15 border-black/40 hover:brightness-110"
    );

    return (
        <nav className="sticky top-0 z-10 backdrop-blur-md bg-black/10 border-b border-black/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
                <div className="flex justify-between h-16 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/keuangan" className="text-2xl font-black mc-title tracking-tight">
                            MoneyM
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <Link to="/keuangan" className={linkClass('/keuangan')}>Kelola Keuangan</Link>
                            <Link to="/kegiatan" className={linkClass('/kegiatan')}>Kelola Kegiatan</Link>
                            <Link to="/kendaraan" className={linkClass('/kendaraan')}>Kelola Kendaraan</Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="hidden md:inline mc-muted font-black">Hi, {user?.name}</span>
                        {setAccent ? (
                            <select
                                value={accent}
                                onChange={(e) => setAccent(e.target.value)}
                                className="px-3 py-2 rounded-md border-2 border-black/60 bg-black/25 text-white/90 font-black"
                            >
                                <option value="neon">Neon</option>
                                <option value="emerald">Emerald</option>
                            </select>
                        ) : null}
                        <button
                            onClick={onLogout}
                            className="mc-btn mc-btn-red"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div className="sm:hidden px-4 pb-3 flex gap-2">
                <Link to="/keuangan" className={linkClass('/keuangan')}>Keuangan</Link>
                <Link to="/kegiatan" className={linkClass('/kegiatan')}>Kegiatan</Link>
                <Link to="/kendaraan" className={linkClass('/kendaraan')}>Kendaraan</Link>
            </div>
        </nav>
    );
}
