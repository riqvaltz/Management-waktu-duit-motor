import React from 'react';

export default function ActivityForm({ isOpen, onClose, onSubmit, initialValue }) {
    if (!isOpen) return null;

    const timePattern = '^([01]\\d|2[0-3]):[0-5]\\d$';

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSubmit({
            title: String(formData.get('title') || ''),
            start_time: String(formData.get('start_time') || ''),
            end_time: String(formData.get('end_time') || ''),
            notes: String(formData.get('notes') || ''),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md p-6 rounded-2xl shadow-xl ring-1 ring-slate-800 bg-slate-900/70 transform transition-all animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-slate-100">{initialValue?.id ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Judul</label>
                        <input
                            type="text"
                            name="title"
                            required
                            defaultValue={initialValue?.title || ''}
                            placeholder="Contoh: Nyapu"
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Mulai</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="start_time"
                                required
                                defaultValue={initialValue?.start_time || '08:00'}
                                placeholder="10:00"
                                pattern={timePattern}
                                title="Format 24 jam: HH:MM (contoh 10:00)"
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Selesai</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="end_time"
                                required
                                defaultValue={initialValue?.end_time || '09:00'}
                                placeholder="11:00"
                                pattern={timePattern}
                                title="Format 24 jam: HH:MM (contoh 11:00)"
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Catatan</label>
                        <textarea
                            name="notes"
                            rows={3}
                            defaultValue={initialValue?.notes || ''}
                            placeholder="Opsional..."
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
