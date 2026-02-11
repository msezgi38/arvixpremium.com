'use client';

import { useState, useEffect } from 'react';

interface NavLink { name: string; href: string; active: boolean; }
interface HeaderData { navLinks: NavLink[]; ctaText: string; ctaLink: string; }

export default function HeaderAdmin() {
    const [data, setData] = useState<HeaderData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetch('/api/header').then(r => r.json()).then(setData).catch(() => { }); }, []);

    const save = async () => {
        if (!data) return;
        const res = await fetch('/api/header', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { setMsg('Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    const addLink = () => {
        if (!data) return;
        setData({ ...data, navLinks: [...data.navLinks, { name: '', href: '/', active: true }] });
    };

    const removeLink = (i: number) => {
        if (!data) return;
        setData({ ...data, navLinks: data.navLinks.filter((_, idx) => idx !== i) });
    };

    const updateLink = (i: number, field: string, value: string | boolean) => {
        if (!data) return;
        const links = [...data.navLinks];
        links[i] = { ...links[i], [field]: value };
        setData({ ...data, navLinks: links });
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Header Yönetimi</h1>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 mb-4 text-sm">{msg}</div>}

            {/* CTA Button */}
            <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4">
                <h2 className="font-bold text-lg">CTA Buton</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Yazısı</label>
                        <input value={data.ctaText} onChange={e => setData({ ...data, ctaText: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Linki</label>
                        <input value={data.ctaLink} onChange={e => setData({ ...data, ctaLink: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Navigasyon Linkleri</h2>
                    <button onClick={addLink} className="text-xs bg-neutral-100 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-200">+ Yeni Link</button>
                </div>
                <div className="space-y-3">
                    {data.navLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <input value={link.name} onChange={e => updateLink(i, 'name', e.target.value)} placeholder="İsim" className="border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                                <input value={link.href} onChange={e => updateLink(i, 'href', e.target.value)} placeholder="Link (/sayfa)" className="border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                            </div>
                            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                                <input type="checkbox" checked={link.active} onChange={e => updateLink(i, 'active', e.target.checked)} /> Aktif
                            </label>
                            <button onClick={() => removeLink(i)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
