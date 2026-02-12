'use client';

import { useState, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HeaderData = any;

export default function HeaderAdmin() {
    const [data, setData] = useState<HeaderData>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=header', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) setData(d);
                else {
                    fetch('/api/header', { cache: 'no-store' }).then(r => r.json()).then(old => {
                        setData(old);
                        fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'header', value: old }) });
                    }).catch(() => setData({}));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'header', value: data }) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Header Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Navigasyon Linkleri</h2>
                    {(data.navLinks || []).map((link: { name: string; href: string; active: boolean }, i: number) => (
                        <div key={i} className="flex items-center gap-3 border-b pb-3">
                            <input value={link.name} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], name: e.target.value }; setData({ ...data, navLinks: n }); }} className="flex-1 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" placeholder="Link adı" />
                            <input value={link.href} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], href: e.target.value }; setData({ ...data, navLinks: n }); }} className="flex-1 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" placeholder="/sayfa" />
                            <label className="flex items-center gap-1.5 text-xs">
                                <input type="checkbox" checked={link.active} onChange={e => { const n = [...data.navLinks]; n[i] = { ...n[i], active: e.target.checked }; setData({ ...data, navLinks: n }); }} />
                                Aktif
                            </label>
                        </div>
                    ))}
                    <button onClick={() => setData({ ...data, navLinks: [...(data.navLinks || []), { name: '', href: '/', active: true }] })} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded font-semibold mt-2">+ Yeni Link Ekle</button>
                </div>

                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">CTA Butonu</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Metni</label><input value={data.ctaText || ''} onChange={e => setData({ ...data, ctaText: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Buton Linki</label><input value={data.ctaLink || ''} onChange={e => setData({ ...data, ctaLink: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                    </div>
                </div>
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
