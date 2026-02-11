'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AboutData = any;

export default function HakkimizdaAdmin() {
    const [data, setData] = useState<AboutData>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=about', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) setData(d);
                else {
                    // Fallback: try loading from old JSON API and migrate
                    fetch('/api/about', { cache: 'no-store' })
                        .then(r => r.json())
                        .then(old => {
                            setData(old);
                            // Auto-migrate to database
                            fetch('/api/db/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'about', value: old }),
                            });
                        })
                        .catch(() => setData({}));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'about', value: data }),
        });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
        else setMsg('Hata oluştu');
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Hakkımızda Sayfası</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">
                {/* Hero */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Hero Bölümü</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.hero?.title || ''} onChange={e => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Alt Başlık</label><input value={data.hero?.subtitle || ''} onChange={e => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <ImageUpload value={data.hero?.image || ''} onChange={url => setData({ ...data, hero: { ...data.hero, image: url } })} folder="about" label="Hero Görseli" />
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero?.overlayOpacity || 0.6} onChange={e => setData({ ...data, hero: { ...data.hero, overlayOpacity: parseFloat(e.target.value) } })} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                </div>

                {/* Intro */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Giriş Bölümü</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.intro?.title || ''} onChange={e => setData({ ...data, intro: { ...data.intro, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Paragraflar (her satır ayrı paragraf)</label><textarea value={(data.intro?.paragraphs || []).join('\n')} onChange={e => setData({ ...data, intro: { ...data.intro, paragraphs: e.target.value.split('\n') } })} rows={5} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <ImageUpload value={data.intro?.image || ''} onChange={url => setData({ ...data, intro: { ...data.intro, image: url } })} folder="about" label="Giriş Görseli" />
                </div>

                {/* Stats */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">İstatistikler</h2>
                    {(data.stats || []).map((stat: { number: string; label: string }, i: number) => (
                        <div key={i} className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Numara</label><input value={stat.number} onChange={e => { const s = [...data.stats]; s[i] = { ...s[i], number: e.target.value }; setData({ ...data, stats: s }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Etiket</label><input value={stat.label} onChange={e => { const s = [...data.stats]; s[i] = { ...s[i], label: e.target.value }; setData({ ...data, stats: s }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                        </div>
                    ))}
                </div>

                {/* Values */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Değerlerimiz</h2>
                    {(data.values || []).map((val: { title: string; description: string }, i: number) => (
                        <div key={i} className="grid grid-cols-2 gap-4 border-b pb-4">
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={val.title} onChange={e => { const v = [...data.values]; v[i] = { ...v[i], title: e.target.value }; setData({ ...data, values: v }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Açıklama</label><input value={val.description} onChange={e => { const v = [...data.values]; v[i] = { ...v[i], description: e.target.value }; setData({ ...data, values: v }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
