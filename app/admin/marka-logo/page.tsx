'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrandData = any;

export default function MarkaLogoAdmin() {
    const [data, setData] = useState<BrandData>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetch('/api/brand').then(r => r.json()).then(setData).catch(() => setData(null)); }, []);

    const save = async () => {
        const res = await fetch('/api/brand', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { setMsg('Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Marka & Logo Sayfası</h1>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 mb-4 text-sm">{msg}</div>}

            <div className="space-y-6">
                {/* Hero */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Hero</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.hero?.title || ''} onChange={e => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Alt Başlık</label><input value={data.hero?.subtitle || ''} onChange={e => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <ImageUpload value={data.hero?.image || ''} onChange={url => setData({ ...data, hero: { ...data.hero, image: url } })} folder="brand" label="Hero Görseli" />
                </div>

                {/* Content */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">İçerik</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.content?.title || ''} onChange={e => setData({ ...data, content: { ...data.content, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Paragraflar (her satır ayrı paragraf)</label><textarea value={(data.content?.paragraphs || []).join('\n')} onChange={e => setData({ ...data, content: { ...data.content, paragraphs: e.target.value.split('\n') } })} rows={5} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <ImageUpload value={data.content?.image || ''} onChange={url => setData({ ...data, content: { ...data.content, image: url } })} folder="brand" label="İçerik Görseli" />
                </div>

                {/* Features */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Özellikler</h2>
                    {(data.features || []).map((f: { id: number; title: string; description: string; image: string }, i: number) => (
                        <div key={i} className="border-b border-neutral-100 pb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={f.title} onChange={e => { const fs = [...data.features]; fs[i] = { ...fs[i], title: e.target.value }; setData({ ...data, features: fs }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                                <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Açıklama</label><input value={f.description} onChange={e => { const fs = [...data.features]; fs[i] = { ...fs[i], description: e.target.value }; setData({ ...data, features: fs }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                            </div>
                            <ImageUpload value={f.image} onChange={url => { const fs = [...data.features]; fs[i] = { ...fs[i], image: url }; setData({ ...data, features: fs }); }} folder="brand" label="Özellik Görseli" />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">CTA</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.cta?.title || ''} onChange={e => setData({ ...data, cta: { ...data.cta, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Alt Başlık</label><input value={data.cta?.subtitle || ''} onChange={e => setData({ ...data, cta: { ...data.cta, subtitle: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Yazısı</label><input value={data.cta?.buttonText || ''} onChange={e => setData({ ...data, cta: { ...data.cta, buttonText: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Linki</label><input value={data.cta?.buttonLink || ''} onChange={e => setData({ ...data, cta: { ...data.cta, buttonLink: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
