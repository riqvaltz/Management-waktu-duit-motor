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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-opacity">
            <div className="w-full max-w-lg p-6 mc-panel transform transition-all animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-black mb-4 mc-title">{initialValue?.id ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-black mc-muted">Merek</label>
                            <input
                                list="brandList"
                                name="brand"
                                required
                                defaultValue={initialValue?.brand || 'Honda'}
                                className="mt-1 mc-input"
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
                            <label className="block text-sm font-black mc-muted">Tahun</label>
                            <select
                                name="year"
                                required
                                defaultValue={initialValue?.year || 2025}
                                className="mt-1 mc-input"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black mc-muted">Nama/Model</label>
                        <input
                            name="model"
                            required
                            defaultValue={initialValue?.model || ''}
                            placeholder="Contoh: Vario 125 / Brio"
                            className="mt-1 mc-input"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-black mc-muted">Interval Oli (KM)</label>
                            <input
                                type="number"
                                name="oil_interval_km"
                                min="500"
                                step="100"
                                defaultValue={initialValue?.oil_interval_km ?? 5000}
                                className="mt-1 mc-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black mc-muted">KM Saat Ini</label>
                            <input
                                type="number"
                                name="current_km"
                                min="0"
                                step="1"
                                defaultValue={initialValue?.current_km ?? 0}
                                className="mt-1 mc-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black mc-muted">KM Ganti Oli Terakhir</label>
                            <input
                                type="number"
                                name="last_oil_change_km"
                                min="0"
                                step="1"
                                defaultValue={initialValue?.last_oil_change_km ?? ''}
                                placeholder="kosongkan = sama dengan KM saat ini"
                                className="mt-1 mc-input"
                            />
                        </div>
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
