import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        if (data.password !== data.password_confirmation) {
            return toast.error('Konfirmasi password tidak cocok!');
        }

        const success = await register(data);
        if (success) navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900/80 text-slate-100 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-800"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Join the Hype!
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Mulai perjalanan finansialmu yang luar biasa! 🔥</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-1">Nama Lengkap</label>
                            <input type="text" name="name" className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-1">Username</label>
                            <input type="text" name="username" className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="johndoe" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Email</label>
                        <input type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="john@example.com" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-1">Password</label>
                            <input type="password" name="password" className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="••••••••" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-1">Confirm Password</label>
                            <input type="password" name="password_confirmation" className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="••••••••" required />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-xl shadow-lg mt-4"
                    >
                        DAFTAR SEKARANG 🚀
                    </motion.button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-emerald-400 font-bold hover:underline">
                        Login disini
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
