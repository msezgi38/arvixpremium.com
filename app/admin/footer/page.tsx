'use client';

import { useState, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FooterData = any;

export default function FooterAdmin() {
    const [data, setData] = useState<FooterData>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=footer', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) setData(d);
                else {
                    fetch('/api/footer', { cache: 'no-store' }).then(r => r.json()).then(old => {
                        setData(old);
                        fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'footer', value: old }) });
                    }).catch(() => setData({}));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'footer', value: data }) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Footer Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">
                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Şirket Bilgileri</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Şirket Adı</label><input value={data.company?.name || ''} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Açıklama</label><textarea value={data.company?.description || ''} onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })} rows={3} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                </div>

                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">İletişim</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Email</label><input value={data.contact?.email || ''} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Telefon</label><input value={data.contact?.phone || ''} onChange={e => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Adres</label><input value={data.contact?.address || ''} onChange={e => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" /></div>
                </div>

                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Sosyal Medya</h2>
                    {(data.socialLinks || []).map((s: { name: string; url: string; active: boolean }, i: number) => (
                        <div key={i} className="flex items-center gap-3 border-b pb-3">
                            <input value={s.name} onChange={e => { const n = [...data.socialLinks]; n[i] = { ...n[i], name: e.target.value }; setData({ ...data, socialLinks: n }); }} className="w-32 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" />
                            <input value={s.url} onChange={e => { const n = [...data.socialLinks]; n[i] = { ...n[i], url: e.target.value }; setData({ ...data, socialLinks: n }); }} className="flex-1 border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" placeholder="https://..." />
                            <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={s.active} onChange={e => { const n = [...data.socialLinks]; n[i] = { ...n[i], active: e.target.checked }; setData({ ...data, socialLinks: n }); }} /> Aktif</label>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-neutral-200 p-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">Copyright</h2>
                    <input value={data.copyright || ''} onChange={e => setData({ ...data, copyright: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-black" />
                </div>
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
