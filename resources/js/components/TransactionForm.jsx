import React from 'react';

export default function TransactionForm({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSubmit({
            amount: formData.get('amount'),
            type: formData.get('type'),
            description: formData.get('description'),
            category: formData.get('category'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md p-6 rounded-2xl shadow-xl ring-1 ring-slate-800 bg-slate-900/70 transform transition-all animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-slate-100">Tambah Transaksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Jenis</label>
                        <select name="type" className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none">
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                            <option value="initial_balance">Saldo Awal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Nominal (Rp)</label>
                        <input 
                            type="number" 
                            name="amount" 
                            required 
                            min="0"
                            placeholder="0"
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Keterangan</label>
                        <input 
                            type="text" 
                            name="description" 
                            placeholder="Contoh: Makan Siang"
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Kategori</label>
                        <input 
                            type="text" 
                            name="category" 
                            placeholder="Contoh: Food"
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none" 
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 text-white rounded-md bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 transition-colors">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
