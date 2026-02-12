'use client';

import { useState, useEffect } from 'react';

interface ContactMsg {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    subject: string | null;
    message: string;
    fields: string | null;
    status: string;
    note: string | null;
    createdAt: string;
}

export default function MesajlarAdmin() {
    const [items, setItems] = useState<ContactMsg[]>([]);
    const [selected, setSelected] = useState<ContactMsg | null>(null);
    const [note, setNote] = useState('');
    const [msg, setMsg] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'contacted'>('all');

    const load = () => fetch('/api/db/contact-messages', { cache: 'no-store' }).then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    useEffect(() => { load(); }, []);

    const updateStatus = async (id: string, status: string, adminNote?: string) => {
        const res = await fetch('/api/db/contact-messages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, note: adminNote }),
        });
        if (res.ok) {
            setMsg(status === 'contacted' ? '✓ Bilgi verildi olarak işaretlendi' : '✓ Güncellendi');
            load();
            if (selected?.id === id) setSelected(null);
            setTimeout(() => setMsg(''), 2000);
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        const res = await fetch(`/api/db/contact-messages?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setMsg('✓ Silindi');
            load();
            if (selected?.id === id) setSelected(null);
            setTimeout(() => setMsg(''), 2000);
        }
    };

    const parseFields = (jsonStr: string | null): Record<string, string> => {
        if (!jsonStr) return {};
        try { return JSON.parse(jsonStr); } catch { return {}; }
    };

    const filtered = items.filter(i => filter === 'all' ? true : i.status === filter);
    const pendingCount = items.filter(i => i.status === 'pending').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">İletişim Mesajları</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">{pendingCount} Yeni Mesaj</span>
                )}
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                <button onClick={() => setFilter('all')} className={`text-xs uppercase tracking-wider px-4 py-2 rounded font-semibold transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                    Tümü ({items.length})
                </button>
                <button onClick={() => setFilter('pending')} className={`text-xs uppercase tracking-wider px-4 py-2 rounded font-semibold transition-colors ${filter === 'pending' ? 'bg-red-500 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-red-600'}`}>
                    Bilgi Verilmedi ({pendingCount})
                </button>
                <button onClick={() => setFilter('contacted')} className={`text-xs uppercase tracking-wider px-4 py-2 rounded font-semibold transition-colors ${filter === 'contacted' ? 'bg-green-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-green-600'}`}>
                    Bilgi Verildi ({items.length - pendingCount})
                </button>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Mesaj Detayı</h2>
                        <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-black text-lg">✕</button>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-lg">
                        <div><p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Ad Soyad</p><p className="text-sm font-semibold">{selected.name}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">E-posta</p><a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline">{selected.email}</a></div>
                        {selected.phone && <div><p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Telefon</p><a href={`tel:${selected.phone}`} className="text-sm text-blue-600 hover:underline">{selected.phone}</a></div>}
                        {selected.company && <div><p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Firma</p><p className="text-sm">{selected.company}</p></div>}
                    </div>

                    {/* Subject */}
                    {selected.subject && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Konu</h3>
                            <p className="text-sm font-medium">{selected.subject}</p>
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Mesaj</h3>
                        <p className="text-sm bg-neutral-50 p-4 rounded whitespace-pre-wrap">{selected.message}</p>
                    </div>

                    {/* Extra Fields */}
                    {selected.fields && Object.keys(parseFields(selected.fields)).length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Ek Bilgiler</h3>
                            <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded text-sm">
                                {Object.entries(parseFields(selected.fields)).map(([key, val]) => (
                                    <div key={key}><span className="text-neutral-400">{key}:</span> <span className="font-medium">{val}</span></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Note & Actions */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1 block">Admin Notu</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" placeholder="Not ekleyin (opsiyonel)..." />
                    </div>
                    <div className="flex gap-2">
                        {selected.status === 'pending' ? (
                            <button onClick={() => updateStatus(selected.id, 'contacted', note)} className="bg-green-600 text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-green-700 rounded font-semibold">
                                ✓ Bilgi Verildi Olarak İşaretle
                            </button>
                        ) : (
                            <button onClick={() => updateStatus(selected.id, 'pending', note)} className="bg-orange-500 text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-orange-600 rounded font-semibold">
                                ↩ Beklemede Olarak İşaretle
                            </button>
                        )}
                        <button onClick={() => setSelected(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50 rounded">İptal</button>
                        <button onClick={() => deleteItem(selected.id)} className="ml-auto bg-red-500 text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-red-600 rounded font-semibold">🗑 Sil</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Durum</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Gönderen</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">E-posta</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Konu</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Mesaj</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Tarih</th>
                            <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => (
                            <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold ${item.status === 'pending' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {item.status === 'pending' ? 'Bilgi Verilmedi' : 'Bilgi Verildi'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold">{item.name}</p>
                                    {item.company && <p className="text-xs text-neutral-400">{item.company}</p>}
                                </td>
                                <td className="px-4 py-3 text-neutral-500">{item.email}</td>
                                <td className="px-4 py-3 text-neutral-500">{item.subject || '-'}</td>
                                <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate">{item.message}</td>
                                <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => { setSelected(item); setNote(item.note || ''); }} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Detay</button>
                                    <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold ml-2">Sil</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-neutral-400 text-sm">Henüz mesaj yok</td></tr>}
                    </tbody>
                </table>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
