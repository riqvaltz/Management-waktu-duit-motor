import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        const success = await login(username, password);
        if (success) navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900/80 text-slate-100 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        Welcome Back!
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Siap mengatur keuanganmu hari ini? 🚀</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-300 transition-all outline-none bg-slate-800 placeholder-slate-500"
                            placeholder="Masukkan username kamu"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-300 transition-all outline-none bg-slate-800 placeholder-slate-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                        LOGIN SEKARANG
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-slate-400">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-cyan-400 font-bold hover:underline">
                        Daftar disini
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
