'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface BlogPost { id?: string; title: string; slug: string; excerpt: string; content: string; image: string; author: string; published: boolean; order: number; }

export default function BlogAdmin() {
    const [items, setItems] = useState<BlogPost[]>([]);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [msg, setMsg] = useState('');

    const load = () => fetch('/api/db/blog', { cache: 'no-store' }).then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!editing) return;
        const method = editing.id ? 'PUT' : 'POST';
        const body = { ...editing };
        if (!body.slug) body.slug = body.title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const res = await fetch('/api/db/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setEditing(null); load(); setTimeout(() => setMsg(''), 2000); }
    };

    const remove = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/db/blog?id=${id}`, { method: 'DELETE' });
        load();
    };

    const newPost = (): BlogPost => ({ title: '', slug: '', excerpt: '', content: '', image: '', author: 'Arvix Ekibi', published: false, order: items.length });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={() => setEditing(newPost())} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">+ Yeni Yazı</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {editing && (
                <div className="bg-white border border-neutral-200 p-6 mb-6 space-y-4 rounded-lg">
                    <h2 className="font-bold text-lg">{editing.id ? 'Düzenle' : 'Yeni Blog Yazısı'}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Başlık</label><input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                        <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Slug (URL)</label><input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" placeholder="otomatik oluşturulur" /></div>
                    </div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Yazar</label><input value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Özet</label><textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    <div><label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">İçerik (Markdown)</label><textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={10} className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black font-mono rounded" /></div>
                    <ImageUpload value={editing.image} onChange={url => setEditing({ ...editing, image: url })} folder="blog" label="Kapak Görseli" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} /> Yayınla</label>
                    <div className="flex gap-2">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">Kaydet</button>
                        <button onClick={() => setEditing(null)} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-50">İptal</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4 rounded-lg">
                        <div className="w-20 h-12 bg-neutral-100 flex-shrink-0 overflow-hidden rounded">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-neutral-400">{item.author}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${item.published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{item.published ? 'Yayında' : 'Taslak'}</span>
                        <button onClick={() => setEditing({ ...item })} className="text-xs text-neutral-500 hover:text-black">Düzenle</button>
                        <button onClick={() => remove(item.id!)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-neutral-400 text-center py-8">Henüz blog yazısı eklenmemiş</p>}
            </div>
            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
