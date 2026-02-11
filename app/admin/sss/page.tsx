'use client';

import { useState, useEffect } from 'react';

interface FaqItem { id?: string; question: string; answer: string; active: boolean; order: number; }

export default function SSSAdmin() {
    const [items, setItems] = useState<FaqItem[]>([]);
    const [editing, setEditing] = useState<FaqItem | null>(null);
    const [msg, setMsg] = useState('');

    const load = () => fetch('/api/db/faq', { cache: 'no-store' }).then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!editing) return;
        const method = editing.id ? 'PUT' : 'POST';
        const res = await fetch('/api/db/faq', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setEditing(null); load(); setTimeout(() => setMsg(''), 2000); }
    };

    const remove = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/db/faq?id=${id}`, { method: 'DELETE' });
        load();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">SSS Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={() => setEditing({ question: '', answer: '', active: true, order: items.length })} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">+ Yeni Soru</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {editing && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">{editing.id ? 'Düzenle' : 'Yeni Soru'}</h2>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Soru</label><input value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Cevap</label><textarea value={editing.answer} onChange={e => setEditing({ ...editing, answer: e.target.value })} rows={4} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Sıra</label><input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Aktif</label>
                    <div className="flex gap-2">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
                        <button onClick={() => setEditing(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50">İptal</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{item.question}</p>
                            <p className="text-xs text-neutral-400 truncate mt-1">{item.answer}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${item.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{item.active ? 'Aktif' : 'Pasif'}</span>
                        <button onClick={() => setEditing({ ...item })} className="text-xs text-neutral-500 hover:text-black">Düzenle</button>
                        <button onClick={() => remove(item.id!)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-neutral-400 text-center py-8">Henüz SSS eklenmemiş</p>}
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
