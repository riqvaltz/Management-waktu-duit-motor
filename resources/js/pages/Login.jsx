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
        <div className="mc-world flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mc-panel p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black mc-title">
                        Welcome Back!
                    </h1>
                    <p className="mc-muted mt-2 font-black">Siap mengatur keuanganmu hari ini? Let's-a go!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black mc-muted mb-2">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            className="mc-input"
                            placeholder="Masukkan username kamu"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black mc-muted mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="mc-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full mc-btn mc-btn-red"
                    >
                        LOGIN SEKARANG
                    </motion.button>
                </form>

                <p className="mt-8 text-center mc-muted font-black">
                    Belum punya akun?{' '}
                    <Link to="/register" className="mc-link">
                        Daftar disini
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
