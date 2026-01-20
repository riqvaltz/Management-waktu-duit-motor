import React from 'react';

export default function VehicleForm({ isOpen, onClose, onSubmit, initialValue }) {
    if (!isOpen) return null;

    const years = [];
    for (let y = 2025; y >= 2010; y -= 1) years.push(y);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const oilInterval = formData.get('oil_interval_km');
        const currentKm = formData.get('current_km');
        const lastOil = formData.get('last_oil_change_km');
        onSubmit({
            brand: String(formData.get('brand') || ''),
            model: String(formData.get('model') || ''),
            year: Number(formData.get('year')),
            oil_interval_km: oilInterval === '' ? undefined : Number(oilInterval),
            current_km: currentKm === '' ? undefined : Number(currentKm),
            last_oil_change_km: lastOil === '' ? undefined : Number(lastOil),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg p-6 rounded-2xl shadow-xl ring-1 ring-slate-800 bg-slate-900/70 transform transition-all animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4 text-slate-100">{initialValue?.id ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Merek</label>
                            <input
                                list="brandList"
                                name="brand"
                                required
                                defaultValue={initialValue?.brand || 'Honda'}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                            <datalist id="brandList">
                                <option value="Honda" />
                                <option value="Toyota" />
                                <option value="Suzuki" />
                                <option value="Yamaha" />
                                <option value="Daihatsu" />
                                <option value="Mitsubishi" />
                                <option value="Nissan" />
                                <option value="Kawasaki" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Tahun</label>
                            <select
                                name="year"
                                required
                                defaultValue={initialValue?.year || 2025}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Nama/Model</label>
                        <input
                            name="model"
                            required
                            defaultValue={initialValue?.model || ''}
                            placeholder="Contoh: Vario 125 / Brio"
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Interval Oli (KM)</label>
                            <input
                                type="number"
                                name="oil_interval_km"
                                min="500"
                                step="100"
                                defaultValue={initialValue?.oil_interval_km ?? 5000}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">KM Saat Ini</label>
                            <input
                                type="number"
                                name="current_km"
                                min="0"
                                step="1"
                                defaultValue={initialValue?.current_km ?? 0}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">KM Ganti Oli Terakhir</label>
                            <input
                                type="number"
                                name="last_oil_change_km"
                                min="0"
                                step="1"
                                defaultValue={initialValue?.last_oil_change_km ?? ''}
                                placeholder="kosongkan = sama dengan KM saat ini"
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-100 shadow-sm p-2 focus:border-cyan-500 focus:ring-cyan-500 outline-none"
                            />
                        </div>
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

