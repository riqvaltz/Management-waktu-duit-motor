import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Kegiatan from './pages/Kegiatan';
import Kendaraan from './pages/Kendaraan';

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!token) return <Navigate to="/login" />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (token) return <Navigate to="/keuangan" />;
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/" element={<ProtectedRoute><Navigate to="/keuangan" /></ProtectedRoute>} />
                    <Route path="/keuangan" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/kegiatan" element={<ProtectedRoute><Kegiatan /></ProtectedRoute>} />
                    <Route path="/kendaraan" element={<ProtectedRoute><Kendaraan /></ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
