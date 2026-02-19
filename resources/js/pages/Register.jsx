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
        <div className="mc-world flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mc-panel p-8 w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black mc-title">
                        Start Your Adventure!
                    </h1>
                    <p className="mc-muted mt-2 font-black">Buat akun dan mulai petualangan finansialmu.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black mc-muted mb-1">Nama Lengkap</label>
                            <input type="text" name="name" className="mc-input" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-sm font-black mc-muted mb-1">Username</label>
                            <input type="text" name="username" className="mc-input" placeholder="johndoe" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black mc-muted mb-1">Email</label>
                        <input type="email" name="email" className="mc-input" placeholder="john@example.com" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black mc-muted mb-1">Password</label>
                            <input type="password" name="password" className="mc-input" placeholder="••••••••" required />
                        </div>
                        <div>
                            <label className="block text-sm font-black mc-muted mb-1">Confirm Password</label>
                            <input type="password" name="password_confirmation" className="mc-input" placeholder="••••••••" required />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full mc-btn mc-btn-green mt-4"
                    >
                        DAFTAR SEKARANG
                    </motion.button>
                </form>

                <p className="mt-6 text-center mc-muted font-black">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="mc-link">
                        Login disini
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
