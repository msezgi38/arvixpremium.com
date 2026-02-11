'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    published: boolean;
    order: number;
    createdAt?: string;
}

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';

export default function BlogAdmin() {
    const [items, setItems] = useState<BlogPost[]>([]);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [msg, setMsg] = useState('');
    const [tab, setTab] = useState<'list' | 'edit'>('list');

    const load = () => fetch('/api/db/blog', { cache: 'no-store' }).then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    useEffect(() => { load(); }, []);

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9ğüşıöçİĞÜŞÖÇ]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        if (!editing) return;
        const method = editing.id ? 'PUT' : 'POST';
        const body = { ...editing };
        if (!body.slug) body.slug = generateSlug(body.title);
        const res = await fetch('/api/db/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
            setMsg('✓ Kaydedildi!');
            setEditing(null);
            setTab('list');
            load();
            setTimeout(() => setMsg(''), 2000);
        } else {
            setMsg('Hata oluştu');
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/db/blog?id=${id}`, { method: 'DELETE' });
        load();
    };

    const togglePublished = async (item: BlogPost) => {
        await fetch('/api/db/blog', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, published: !item.published }),
        });
        load();
    };

    const newPost = (): BlogPost => ({
        title: '', slug: '', excerpt: '', content: '', image: '',
        author: 'Arvix Ekibi', published: false, order: items.length,
    });

    const startEditing = (post: BlogPost) => {
        setEditing({ ...post });
        setTab('edit');
    };

    const formatDate = (d?: string) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı · {items.length} yazı</p>
                </div>
                <button onClick={() => { setEditing(newPost()); setTab('edit'); }} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">+ Yeni Yazı</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-neutral-200">
                <button onClick={() => setTab('list')} className={`text-xs uppercase tracking-wider px-4 py-2.5 font-semibold border-b-2 transition-colors ${tab === 'list' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'}`}>Liste ({items.length})</button>
                {editing && <button onClick={() => setTab('edit')} className={`text-xs uppercase tracking-wider px-4 py-2.5 font-semibold border-b-2 transition-colors ${tab === 'edit' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'}`}>{editing.id ? 'Düzenle' : 'Yeni Yazı'}</button>}
            </div>

            {/* LIST */}
            {tab === 'list' && (
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4 rounded-lg hover:border-neutral-300 transition-colors">
                            <div className="w-24 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden rounded">
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{item.title || 'Başlıksız'}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{item.author} · {formatDate(item.createdAt)}</p>
                                {item.excerpt && <p className="text-xs text-neutral-500 mt-1 truncate">{item.excerpt}</p>}
                            </div>
                            <button onClick={() => togglePublished(item)} className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors ${item.published ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                                {item.published ? '● Yayında' : '○ Taslak'}
                            </button>
                            <button onClick={() => startEditing(item)} className="text-xs text-neutral-500 hover:text-black font-semibold">Düzenle</button>
                            <button onClick={() => remove(item.id!)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Sil</button>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-sm text-neutral-400 text-center py-12">Henüz blog yazısı eklenmemiş</p>}
                </div>
            )}

            {/* EDIT */}
            {tab === 'edit' && editing && (
                <div className="space-y-6">
                    {/* Title & Slug */}
                    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-4">
                        <h2 className="font-bold text-lg border-b pb-2">📝 Başlık & URL</h2>
                        <div>
                            <label className={labelClass}>Başlık</label>
                            <input
                                value={editing.title}
                                onChange={e => {
                                    const title = e.target.value;
                                    setEditing({
                                        ...editing,
                                        title,
                                        slug: editing.id ? editing.slug : generateSlug(title),
                                    });
                                }}
                                className={inputClass}
                                placeholder="Blog yazısı başlığı"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Slug (URL)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-400">/blog/</span>
                                <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className={inputClass} placeholder="otomatik-olusturulur" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Yazar</label>
                                <input value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Sıra</label>
                                <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-4">
                        <h2 className="font-bold text-lg border-b pb-2">🖼️ Kapak Görseli</h2>
                        <ImageUpload value={editing.image} onChange={url => setEditing({ ...editing, image: url })} folder="blog" label="Kapak Görseli" />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-4">
                        <h2 className="font-bold text-lg border-b pb-2">📋 Özet</h2>
                        <div>
                            <label className={labelClass}>Kısa Özet (liste ve kartlarda görünür)</label>
                            <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={3} className={inputClass} placeholder="Blog yazısının kısa açıklaması..." />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-4">
                        <h2 className="font-bold text-lg border-b pb-2">📄 İçerik</h2>
                        <div>
                            <label className={labelClass}>İçerik (Markdown destekli: **kalın**, ## Başlık, 1. Liste)</label>
                            <textarea
                                value={editing.content}
                                onChange={e => setEditing({ ...editing, content: e.target.value })}
                                rows={20}
                                className={`${inputClass} font-mono`}
                                placeholder={"## Alt Başlık\n\nBuraya paragraf içeriği yazın.\n\n**Kalın metin** kullanabilirsiniz.\n\n1. Sıralı liste öğesi\n2. İkinci öğe\n3. Üçüncü öğe"}
                            />
                            <p className="text-xs text-neutral-400 mt-2">
                                İpuçları: <code className="bg-neutral-100 px-1 rounded">## Başlık</code> · <code className="bg-neutral-100 px-1 rounded">**kalın**</code> · <code className="bg-neutral-100 px-1 rounded">1. Liste</code> · Paragraflar arasında boş satır bırakın
                            </p>
                        </div>
                    </div>

                    {/* Publish & Actions */}
                    <div className="bg-white border border-neutral-200 p-6 rounded-lg space-y-4">
                        <h2 className="font-bold text-lg border-b pb-2">⚙️ Yayın Ayarları</h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} className="w-4 h-4" />
                            <span className="text-sm font-semibold">Yayınla</span>
                            <span className="text-xs text-neutral-400">(işaretlenirse sitede görünür)</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
                        <button onClick={() => { setEditing(null); setTab('list'); }} className="border border-neutral-300 text-xs uppercase tracking-wider px-5 py-3 hover:bg-neutral-50 rounded">İptal</button>
                    </div>
                </div>
            )}

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
