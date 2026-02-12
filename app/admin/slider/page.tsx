'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Slide { id?: string; title: string; subtitle: string; image: string; active: boolean; order: number; }

interface SliderSettings {
    height: number;
    mobileHeight: number;
    effect: 'fade' | 'slide' | 'zoom' | 'kenburns';
    speed: number;
    overlayOpacity: number;
    transitionDuration: number;
}

const defaultSettings: SliderSettings = {
    height: 600,
    mobileHeight: 400,
    effect: 'fade',
    speed: 5000,
    overlayOpacity: 0.5,
    transitionDuration: 700,
};

const effectLabels: Record<string, string> = {
    fade: '🔄 Fade (Solma)',
    slide: '➡️ Slide (Kayma)',
    zoom: '🔍 Zoom (Yakınlaşma)',
    kenburns: '🎬 Ken Burns (Sinematik)',
};

export default function SliderAdmin() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [editing, setEditing] = useState<Slide | null>(null);
    const [msg, setMsg] = useState('');
    const [settings, setSettings] = useState<SliderSettings>(defaultSettings);
    const [showSettings, setShowSettings] = useState(false);

    const loadSlides = async () => {
        try {
            const res = await fetch('/api/db/slides', { cache: 'no-store' });
            const data = await res.json();
            setSlides(Array.isArray(data) ? data : []);
        } catch { setSlides([]); }
    };

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/db/settings?key=slider-settings', { cache: 'no-store' });
            const data = await res.json();
            if (data && Object.keys(data).length > 0) setSettings({ ...defaultSettings, ...data });
        } catch { /* use defaults */ }
    };

    useEffect(() => { loadSlides(); loadSettings(); }, []);

    const save = async () => {
        if (!editing) return;
        const method = editing.id ? 'PUT' : 'POST';
        const res = await fetch('/api/db/slides', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setEditing(null); await loadSlides(); setTimeout(() => setMsg(''), 2000); }
    };

    const saveSettings = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'slider-settings', value: settings }),
        });
        if (res.ok) { setMsg('✓ Ayarlar kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    const remove = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/db/slides?id=${id}`, { method: 'DELETE' });
        await loadSlides();
    };

    const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
    const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className={`text-xs uppercase tracking-wider px-4 py-2.5 rounded ${showSettings ? 'bg-neutral-700 text-white' : 'border border-neutral-300 hover:bg-neutral-50'}`}>⚙ Ayarlar</button>
                    <button onClick={() => setEditing({ title: '', subtitle: '', image: '', active: true, order: slides.length })} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">+ Yeni Slide</button>
                </div>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-5 rounded-lg">
                    <h2 className="font-bold text-lg border-b pb-2">⚙ Slider Ayarları</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelClass}>Desktop Yükseklik (px)</label>
                            <input type="number" value={settings.height} onChange={e => setSettings({ ...settings, height: parseInt(e.target.value) || 400 })} className={inputClass} min={200} max={1200} step={50} />
                        </div>
                        <div>
                            <label className={labelClass}>Mobil Yükseklik (px)</label>
                            <input type="number" value={settings.mobileHeight} onChange={e => setSettings({ ...settings, mobileHeight: parseInt(e.target.value) || 300 })} className={inputClass} min={200} max={800} step={50} />
                        </div>
                        <div>
                            <label className={labelClass}>Otomatik Geçiş (ms)</label>
                            <input type="number" value={settings.speed} onChange={e => setSettings({ ...settings, speed: parseInt(e.target.value) || 3000 })} className={inputClass} min={1000} max={15000} step={500} />
                            <p className="text-[10px] text-neutral-400 mt-1">{(settings.speed / 1000).toFixed(1)} saniye</p>
                        </div>
                        <div>
                            <label className={labelClass}>Geçiş Süresi (ms)</label>
                            <input type="number" value={settings.transitionDuration} onChange={e => setSettings({ ...settings, transitionDuration: parseInt(e.target.value) || 500 })} className={inputClass} min={200} max={2000} step={100} />
                            <p className="text-[10px] text-neutral-400 mt-1">{(settings.transitionDuration / 1000).toFixed(1)} saniye</p>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Karartma Opaklığı: {Math.round(settings.overlayOpacity * 100)}%</label>
                        <input type="range" min="0" max="1" step="0.05" value={settings.overlayOpacity} onChange={e => setSettings({ ...settings, overlayOpacity: parseFloat(e.target.value) })} className="w-full max-w-md accent-black" />
                        <div className="flex justify-between text-[10px] text-neutral-400 max-w-md"><span>Yok</span><span>Tam karanlık</span></div>
                    </div>

                    <div>
                        <label className={labelClass}>Geçiş Efekti</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            {(Object.entries(effectLabels)).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSettings({ ...settings, effect: key as SliderSettings['effect'] })}
                                    className={`p-4 text-center border-2 rounded-lg transition-all ${settings.effect === key ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-neutral-400 bg-white'}`}
                                >
                                    <p className="text-sm font-semibold">{label}</p>
                                    <p className="text-[10px] mt-1 opacity-60">
                                        {key === 'fade' && 'Yumuşak solma efekti'}
                                        {key === 'slide' && 'Sola kayma efekti'}
                                        {key === 'zoom' && 'Yakınlaşarak geçiş'}
                                        {key === 'kenburns' && 'Sinematik hareket'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span>📐 Desktop: {settings.height}px</span>
                        <span>•</span>
                        <span>📱 Mobil: {settings.mobileHeight}px</span>
                        <span>•</span>
                        <span>⏱ Hız: {(settings.speed / 1000).toFixed(1)}s</span>
                        <span>•</span>
                        <span>✨ Efekt: {effectLabels[settings.effect]}</span>
                    </div>

                    <button onClick={saveSettings} className="bg-black text-white text-xs uppercase tracking-wider px-6 py-2.5 hover:bg-neutral-800 rounded">Ayarları Kaydet</button>
                </div>
            )}

            {editing && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg mb-2">{editing.id ? 'Düzenle' : 'Yeni Slide'}</h2>
                    <div><label className={labelClass}>Başlık</label><input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className={inputClass} /></div>
                    <div><label className={labelClass}>Alt Başlık</label><input value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} className={inputClass} /></div>
                    <ImageUpload value={editing.image} onChange={url => setEditing({ ...editing, image: url })} folder="slides" label="Slide Görseli" />
                    <div><label className={labelClass}>Sıra</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Aktif</label>
                    <div className="flex gap-2">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
                        <button onClick={() => setEditing(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50 rounded">İptal</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {slides.map(slide => (
                    <div key={slide.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4 rounded-lg">
                        <div className="w-20 h-12 bg-neutral-100 flex-shrink-0 overflow-hidden rounded">
                            {slide.image && <img src={slide.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{slide.title || '(Başlıksız)'}</p>
                            <p className="text-xs text-neutral-400 truncate">{slide.subtitle}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${slide.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{slide.active ? 'Aktif' : 'Pasif'}</span>
                        <button onClick={() => setEditing({ ...slide })} className="text-xs text-neutral-500 hover:text-black">Düzenle</button>
                        <button onClick={() => remove(slide.id!)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                    </div>
                ))}
                {slides.length === 0 && <p className="text-sm text-neutral-400 text-center py-8">Henüz slide eklenmemiş</p>}
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
