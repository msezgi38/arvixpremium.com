'use client';

import { useState, useEffect } from 'react';

interface FooterData {
    company: { name: string; description: string };
    quickLinks: { name: string; href: string }[];
    contact: { email: string; phone: string; address: string };
    copyright: string;
    socialLinks: { name: string; url: string; active: boolean }[];
}

export default function FooterAdmin() {
    const [data, setData] = useState<FooterData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetch('/api/footer', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => { }); }, []);

    const save = async () => {
        if (!data) return;
        const res = await fetch('/api/footer', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { setMsg('Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
    };

    const addQuickLink = () => {
        if (!data) return;
        setData({ ...data, quickLinks: [...data.quickLinks, { name: '', href: '/' }] });
    };

    const removeQuickLink = (i: number) => {
        if (!data) return;
        setData({ ...data, quickLinks: data.quickLinks.filter((_, idx) => idx !== i) });
    };

    const addSocial = () => {
        if (!data) return;
        setData({ ...data, socialLinks: [...data.socialLinks, { name: 'Instagram', url: '#', active: true }] });
    };

    const removeSocial = (i: number) => {
        if (!data) return;
        setData({ ...data, socialLinks: data.socialLinks.filter((_, idx) => idx !== i) });
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Footer Yönetimi</h1>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
            </div>
            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 mb-4 text-sm">{msg}</div>}

            <div className="space-y-6">
                {/* Company */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Şirket Bilgileri</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Şirket Adı</label>
                            <input value={data.company.name} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Açıklama</label>
                            <input value={data.company.description} onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">İletişim Bilgileri</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">E-posta</label>
                            <input value={data.contact.email} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Telefon</label>
                            <input value={data.contact.phone} onChange={e => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Adres</label>
                            <input value={data.contact.address} onChange={e => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <h2 className="font-bold text-lg">Copyright</h2>
                    <input value={data.copyright} onChange={e => setData({ ...data, copyright: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                </div>

                {/* Quick Links */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Hızlı Bağlantılar</h2>
                        <button onClick={addQuickLink} className="text-xs bg-neutral-100 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-200">+ Yeni Link</button>
                    </div>
                    <div className="space-y-2">
                        {data.quickLinks.map((link, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100">
                                <input value={link.name} onChange={e => { const ql = [...data.quickLinks]; ql[i] = { ...ql[i], name: e.target.value }; setData({ ...data, quickLinks: ql }); }} placeholder="İsim" className="flex-1 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                                <input value={link.href} onChange={e => { const ql = [...data.quickLinks]; ql[i] = { ...ql[i], href: e.target.value }; setData({ ...data, quickLinks: ql }); }} placeholder="Link" className="flex-1 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                                <button onClick={() => removeQuickLink(i)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white border border-neutral-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Sosyal Medya</h2>
                        <button onClick={addSocial} className="text-xs bg-neutral-100 border border-neutral-200 px-3 py-1.5 hover:bg-neutral-200">+ Yeni</button>
                    </div>
                    <div className="space-y-2">
                        {data.socialLinks.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100">
                                <select value={s.name} onChange={e => { const sl = [...data.socialLinks]; sl[i] = { ...sl[i], name: e.target.value }; setData({ ...data, socialLinks: sl }); }} className="border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black">
                                    <option>Instagram</option>
                                    <option>LinkedIn</option>
                                    <option>YouTube</option>
                                </select>
                                <input value={s.url} onChange={e => { const sl = [...data.socialLinks]; sl[i] = { ...sl[i], url: e.target.value }; setData({ ...data, socialLinks: sl }); }} placeholder="URL" className="flex-1 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black" />
                                <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                                    <input type="checkbox" checked={s.active} onChange={e => { const sl = [...data.socialLinks]; sl[i] = { ...sl[i], active: e.target.checked }; setData({ ...data, socialLinks: sl }); }} /> Aktif
                                </label>
                                <button onClick={() => removeSocial(i)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
