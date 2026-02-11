'use client';

import { useState, useEffect } from 'react';

interface FaqItem {
    id?: string;
    question: string;
    answer: string;
    active: boolean;
    order: number;
}

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';

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
        if (res.ok) {
            setMsg('✓ Kaydedildi!');
            setEditing(null);
            load();
            setTimeout(() => setMsg(''), 2000);
        } else {
            setMsg('Hata oluştu');
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/db/faq?id=${id}`, { method: 'DELETE' });
        load();
    };

    const toggleActive = async (item: FaqItem) => {
        await fetch('/api/db/faq', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, active: !item.active }),
        });
        load();
    };

    const moveUp = async (index: number) => {
        if (index <= 0) return;
        const sorted = [...items].sort((a, b) => a.order - b.order);
        const currentOrder = sorted[index].order;
        const prevOrder = sorted[index - 1].order;
        await Promise.all([
            fetch('/api/db/faq', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sorted[index], order: prevOrder }) }),
            fetch('/api/db/faq', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sorted[index - 1], order: currentOrder }) }),
        ]);
        load();
    };

    const moveDown = async (index: number) => {
        const sorted = [...items].sort((a, b) => a.order - b.order);
        if (index >= sorted.length - 1) return;
        const currentOrder = sorted[index].order;
        const nextOrder = sorted[index + 1].order;
        await Promise.all([
            fetch('/api/db/faq', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sorted[index], order: nextOrder }) }),
            fetch('/api/db/faq', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...sorted[index + 1], order: currentOrder }) }),
        ]);
        load();
    };

    const sorted = [...items].sort((a, b) => a.order - b.order);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">SSS Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı · {items.length} soru</p>
                </div>
                <button onClick={() => setEditing({ question: '', answer: '', active: true, order: items.length })} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">+ Yeni Soru</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {/* Edit Form */}
            {editing && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg border-b pb-2">{editing.id ? '✏️ Düzenle' : '➕ Yeni Soru'}</h2>
                    <div>
                        <label className={labelClass}>Soru</label>
                        <input value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} className={inputClass} placeholder="Sık sorulan soruyu yazın..." />
                    </div>
                    <div>
                        <label className={labelClass}>Cevap</label>
                        <textarea value={editing.answer} onChange={e => setEditing({ ...editing, answer: e.target.value })} rows={5} className={inputClass} placeholder="Cevabı detaylı yazın..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Sıra</label>
                            <input type="number" min="0" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer pb-2">
                                <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4" />
                                <span className="text-sm font-semibold">Aktif</span>
                                <span className="text-xs text-neutral-400">(sitede görünsün)</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-6 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
                        <button onClick={() => setEditing(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50 rounded">İptal</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {sorted.map((item, index) => (
                    <div key={item.id} className={`bg-white border border-neutral-200 p-4 flex items-center gap-3 rounded-lg hover:border-neutral-300 transition-colors ${!item.active ? 'opacity-50' : ''}`}>
                        {/* Order buttons */}
                        <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveUp(index)} disabled={index === 0} className="text-neutral-400 hover:text-black disabled:opacity-20 disabled:hover:text-neutral-400 text-xs p-0.5">▲</button>
                            <button onClick={() => moveDown(index)} disabled={index === sorted.length - 1} className="text-neutral-400 hover:text-black disabled:opacity-20 disabled:hover:text-neutral-400 text-xs p-0.5">▼</button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{item.question}</p>
                            <p className="text-xs text-neutral-400 truncate mt-1">{item.answer}</p>
                        </div>

                        {/* Status toggle */}
                        <button onClick={() => toggleActive(item)} className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors ${item.active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {item.active ? '● Aktif' : '○ Pasif'}
                        </button>

                        {/* Actions */}
                        <button onClick={() => setEditing({ ...item })} className="text-xs text-neutral-500 hover:text-black font-semibold">Düzenle</button>
                        <button onClick={() => remove(item.id!)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Sil</button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-neutral-400 text-center py-12">Henüz SSS eklenmemiş</p>}
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
