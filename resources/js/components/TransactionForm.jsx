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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-opacity">
            <div className="w-full max-w-md p-6 mc-panel transform transition-all animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-black mb-4 mc-title">Tambah Transaksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black mc-muted">Jenis</label>
                        <select name="type" className="mt-1 mc-input">
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                            <option value="initial_balance">Saldo Awal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black mc-muted">Nominal (Rp)</label>
                        <input 
                            type="number" 
                            name="amount" 
                            required 
                            min="0"
                            placeholder="0"
                            className="mt-1 mc-input" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black mc-muted">Keterangan</label>
                        <input 
                            type="text" 
                            name="description" 
                            placeholder="Contoh: Makan Siang"
                            className="mt-1 mc-input" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black mc-muted">Kategori</label>
                        <input 
                            type="text" 
                            name="category" 
                            placeholder="Contoh: Food"
                            className="mt-1 mc-input" 
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="mc-btn">
                            Batal
                        </button>
                        <button type="submit" className="mc-btn mc-btn-blue">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
