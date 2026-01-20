import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export default function TopNav({ user, accent, setAccent, onLogout }) {
    const location = useLocation();
    const path = location.pathname;

    const linkClass = (to) => clsx(
        "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
        path === to ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
    );

    return (
        <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/5 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
                <div className="flex justify-between h-16 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/keuangan" className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500">
                            MoneyM
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <Link to="/keuangan" className={linkClass('/keuangan')}>Kelola Keuangan</Link>
                            <Link to="/kegiatan" className={linkClass('/kegiatan')}>Kelola Kegiatan</Link>
                            <Link to="/kendaraan" className={linkClass('/kendaraan')}>Kelola Kendaraan</Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="hidden md:inline text-slate-300 font-medium">Hi, {user?.name}</span>
                        {setAccent ? (
                            <select
                                value={accent}
                                onChange={(e) => setAccent(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100"
                            >
                                <option value="neon">Neon</option>
                                <option value="emerald">Emerald</option>
                            </select>
                        ) : null}
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 shadow-md"
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
