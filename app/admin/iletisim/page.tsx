'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactData = any;

export default function IletisimAdmin() {
    const [data, setData] = useState<ContactData>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetch('/api/contact', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => setData(null)); }, []);

    const save = async () => {
        const res = await fetch('/api/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { setMsg('Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">İletişim Sayfası</h1>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 mb-4 text-sm">{msg}</div>}

            <div className="space-y-6">
                {/* Hero */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Hero Bölümü</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={data.hero?.title || ''} onChange={e => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Alt Başlık</label><input value={data.hero?.subtitle || ''} onChange={e => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <ImageUpload value={data.hero?.image || ''} onChange={url => setData({ ...data, hero: { ...data.hero, image: url } })} folder="contact" label="Hero Görseli" />
                </div>

                {/* Contact Info */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">İletişim Bilgileri</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Email</label><input value={data.info?.email || ''} onChange={e => setData({ ...data, info: { ...data.info, email: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Telefon</label><input value={data.info?.phone || ''} onChange={e => setData({ ...data, info: { ...data.info, phone: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Adres</label><textarea value={data.info?.address || ''} onChange={e => setData({ ...data, info: { ...data.info, address: e.target.value } })} rows={2} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Çalışma Saatleri</label><input value={data.info?.hours || ''} onChange={e => setData({ ...data, info: { ...data.info, hours: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                </div>

                {/* Social */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Sosyal Medya & WhatsApp</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">WhatsApp Numarası</label><input value={data.whatsapp?.number || ''} onChange={e => setData({ ...data, whatsapp: { ...data.whatsapp, number: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">WhatsApp Mesajı</label><input value={data.whatsapp?.message || ''} onChange={e => setData({ ...data, whatsapp: { ...data.whatsapp, message: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                    {(data.social || []).map((s: { platform: string; url: string }, i: number) => (
                        <div key={i} className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Platform</label><input value={s.platform} onChange={e => { const soc = [...data.social]; soc[i] = { ...soc[i], platform: e.target.value }; setData({ ...data, social: soc }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                            <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">URL</label><input value={s.url} onChange={e => { const soc = [...data.social]; soc[i] = { ...soc[i], url: e.target.value }; setData({ ...data, social: soc }); }} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Harita</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Google Maps Embed URL</label><input value={data.map?.embedUrl || ''} onChange={e => setData({ ...data, map: { ...data.map, embedUrl: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" /></div>
                </div>
            </div>
        </div>
    );
}
