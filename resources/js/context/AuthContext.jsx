import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await axios.get('/api/user');
            setUser(res.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await axios.post('/api/login', { username, password });
            const { access_token, user } = res.data;
            setToken(access_token);
            setUser(user);
            localStorage.setItem('token', access_token);
            toast.success('Selamat datang kembali! 🚀');
            return true;
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.errors?.username?.[0] || 'Login gagal';
            toast.error(msg);
            return false;
        }
    };

    const register = async (data) => {
        try {
            const res = await axios.post('/api/register', data);
            const { access_token, user } = res.data;
            setToken(access_token);
            setUser(user);
            localStorage.setItem('token', access_token);
            toast.success('Akun berhasil dibuat! Semangat! 🔥');
            return true;
        } catch (error) {
            console.error(error);
            const msg = Object.values(error.response?.data?.errors || {}).flat()[0] || 'Registrasi gagal';
            toast.error(msg);
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            // ignore
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        toast('Sampai jumpa lagi!', { icon: '👋' });
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
