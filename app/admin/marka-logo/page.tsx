'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Feature {
    id: number;
    title: string;
    description: string;
    image: string;
}

interface BrandData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    content: { title: string; paragraphs: string[]; image: string };
    features: Feature[];
    cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
}

const defaultData: BrandData = {
    hero: { title: '', subtitle: '', image: '', overlayOpacity: 0.6 },
    content: { title: '', paragraphs: [''], image: '' },
    features: [],
    cta: { title: '', subtitle: '', buttonText: '', buttonLink: '' },
};

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function MarkaLogoAdmin() {
    const [data, setData] = useState<BrandData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=brand', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) {
                    setData({ ...defaultData, ...d });
                } else {
                    fetch('/brand/brand.json', { cache: 'no-store' })
                        .then(r => r.json())
                        .then(old => {
                            const merged = { ...defaultData, ...old };
                            setData(merged);
                            fetch('/api/db/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'brand', value: merged }),
                            });
                        })
                        .catch(() => setData(defaultData));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'brand', value: data }),
        });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
        else setMsg('Hata oluştu');
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    const update = (path: string, value: unknown) => {
        const keys = path.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newData: any = JSON.parse(JSON.stringify(data));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (obj[keys[i]] === undefined) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        setData(newData);
    };

    // Feature helpers
    const addFeature = () => {
        const newId = Math.max(0, ...(data.features || []).map(f => f.id)) + 1;
        update('features', [...(data.features || []), { id: newId, title: '', description: '', image: '' }]);
    };
    const removeFeature = (id: number) => {
        update('features', (data.features || []).filter(f => f.id !== id));
    };
    const updateFeature = (id: number, field: string, value: string) => {
        update('features', (data.features || []).map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Marka & Logo Sayfası</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">

                {/* ═══════════ HERO ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🖼️ Hero Bölümü</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.hero?.title || ''} onChange={e => update('hero.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.hero?.subtitle || ''} onChange={e => update('hero.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <ImageUpload value={data.hero?.image || ''} onChange={url => update('hero.image', url)} folder="brand" label="Hero Görseli" />
                    <div><label className={labelClass}>Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero?.overlayOpacity ?? 0.6} onChange={e => update('hero.overlayOpacity', parseFloat(e.target.value))} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                </div>

                {/* ═══════════ İÇERİK ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📝 İçerik Bölümü</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.content?.title || ''} onChange={e => update('content.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Paragraflar (her satır ayrı paragraf)</label><textarea value={(data.content?.paragraphs || []).join('\n')} onChange={e => update('content.paragraphs', e.target.value.split('\n'))} rows={5} className={inputClass} /></div>
                    <ImageUpload value={data.content?.image || ''} onChange={url => update('content.image', url)} folder="brand" label="İçerik Görseli" />
                </div>

                {/* ═══════════ ÖZELLİKLER ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">⭐ Özellikler</h2>
                        <button onClick={addFeature} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Ekle</button>
                    </div>
                    {(data.features || []).map((f) => (
                        <div key={f.id} className="border border-neutral-200 rounded-lg p-4 space-y-3 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-600">Özellik #{f.id}</span>
                                <button onClick={() => removeFeature(f.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className={labelClass}>Başlık</label><input value={f.title} onChange={e => updateFeature(f.id, 'title', e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Açıklama</label><input value={f.description} onChange={e => updateFeature(f.id, 'description', e.target.value)} className={inputClass} /></div>
                            </div>
                            <ImageUpload value={f.image} onChange={url => updateFeature(f.id, 'image', url)} folder="brand" label="Özellik Görseli" />
                        </div>
                    ))}
                    {(data.features || []).length === 0 && <p className="text-sm text-neutral-400">Henüz özellik eklenmedi.</p>}
                </div>

                {/* ═══════════ CTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📢 CTA (Aksiyon Alanı)</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.cta?.title || ''} onChange={e => update('cta.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Alt Başlık</label><input value={data.cta?.subtitle || ''} onChange={e => update('cta.subtitle', e.target.value)} className={inputClass} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.cta?.buttonText || ''} onChange={e => update('cta.buttonText', e.target.value)} className={inputClass} placeholder="Teklif Al" /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.cta?.buttonLink || ''} onChange={e => update('cta.buttonLink', e.target.value)} className={inputClass} placeholder="/iletisim" /></div>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
