'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Slide { id: number; title: string; subtitle: string; image: string; buttonText: string; buttonLink: string; active: boolean; }

export default function SliderAdmin() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [editing, setEditing] = useState<Slide | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetch('/api/slides').then(r => r.json()).then(setSlides).catch(() => setSlides([])); }, []);

    const save = async () => {
        if (!editing) return;
        const method = editing.id ? 'PUT' : 'POST';
        const res = await fetch('/api/slides', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (res.ok) {
            setMsg('Kaydedildi!');
            setEditing(null);
            const data = await fetch('/api/slides').then(r => r.json());
            setSlides(data);
            setTimeout(() => setMsg(''), 2000);
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/slides?id=${id}`, { method: 'DELETE' });
        setSlides(slides.filter(s => s.id !== id));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
                <button onClick={() => setEditing({ id: 0, title: '', subtitle: '', image: '', buttonText: 'Keşfet', buttonLink: '/urunler/plaka-yuklemeli', active: true })} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">+ Yeni Slide</button>
            </div>
            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 mb-4 text-sm">{msg}</div>}

            {editing && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4">
                    <h2 className="font-bold text-lg mb-2">{editing.id ? 'Düzenle' : 'Yeni Slide'}</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Alt Başlık</label><input value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <ImageUpload value={editing.image} onChange={url => setEditing({ ...editing, image: url })} folder="slides" label="Slide Görseli" />
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Yazısı</label><input value={editing.buttonText} onChange={e => setEditing({ ...editing, buttonText: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Linki</label><input value={editing.buttonLink} onChange={e => setEditing({ ...editing, buttonLink: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    </div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Aktif</label>
                    <div className="flex gap-2">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
                        <button onClick={() => setEditing(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50">İptal</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {slides.map(slide => (
                    <div key={slide.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
                        <div className="w-20 h-12 bg-neutral-100 flex-shrink-0 overflow-hidden">
                            {slide.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{slide.title || '(Başlıksız)'}</p>
                            <p className="text-xs text-neutral-400 truncate">{slide.subtitle}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${slide.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{slide.active ? 'Aktif' : 'Pasif'}</span>
                        <button onClick={() => setEditing({ ...slide })} className="text-xs text-neutral-500 hover:text-black">Düzenle</button>
                        <button onClick={() => remove(slide.id)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
