'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    active: boolean;
    order: number;
    parentId: string | null;
    children?: Category[];
    _count?: { products: number; children: number };
}

export default function KategorilerAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editing, setEditing] = useState<Category | null>(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(true);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/db/categories?tree=true', { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch { setCategories([]); }
        setLoading(false);
    };

    useEffect(() => { loadCategories(); }, []);

    const flashMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

    const save = async () => {
        if (!editing) return;
        const isNew = !editing.id || editing.id === 'new';
        const method = isNew ? 'POST' : 'PUT';
        const body: Record<string, unknown> = {
            name: editing.name,
            slug: editing.slug,
            image: editing.image || null,
            active: editing.active,
            order: editing.order,
            parentId: editing.parentId || null,
        };
        if (!isNew) body.id = editing.id;

        const res = await fetch('/api/db/categories', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            flashMsg(isNew ? '✓ Kategori eklendi' : '✓ Kategori güncellendi');
            setEditing(null);
            await loadCategories();
        } else {
            const err = await res.json();
            flashMsg('Hata: ' + (err.error || 'Bilinmeyen hata'));
        }
    };

    const remove = async (cat: Category) => {
        const childCount = cat.children?.length || 0;
        const msg = childCount > 0
            ? `"${cat.name}" ve ${childCount} alt kategori silinecek. Emin misiniz?`
            : `"${cat.name}" silinecek. Emin misiniz?`;
        if (!confirm(msg)) return;
        await fetch(`/api/db/categories?id=${cat.id}`, { method: 'DELETE' });
        flashMsg('Kategori silindi');
        await loadCategories();
    };

    const seed = async () => {
        if (!confirm('Veritabanını varsayılan verilerle doldurmak istiyor musunuz?')) return;
        const res = await fetch('/api/db/seed', { method: 'POST' });
        const data = await res.json();
        flashMsg(data.message || `${data.categories} kategori, ${data.products} ürün eklendi`);
        await loadCategories();
    };

    // Flatten categories for parent selector dropdown
    const flatCategories: { id: string; name: string; depth: number }[] = [];
    const flatten = (cats: Category[], depth = 0) => {
        for (const c of cats) {
            flatCategories.push({ id: c.id, name: c.name, depth });
            if (c.children) flatten(c.children, depth + 1);
        }
    };
    flatten(categories);

    const newCategory = (): Category => ({
        id: 'new', name: '', slug: '', image: null, active: true, order: 0, parentId: null,
    });

    const renderCategory = (cat: Category, depth = 0) => (
        <div key={cat.id}>
            <div
                className={`bg-white border border-neutral-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow ${!cat.active ? 'opacity-50' : ''}`}
                style={{ marginLeft: depth * 24 }}
            >
                <div className="w-12 h-12 bg-neutral-100 flex-shrink-0 overflow-hidden rounded">
                    {cat.image && <img src={cat.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-neutral-400">/urunler/{cat.slug}</p>
                    <div className="flex gap-2 mt-1">
                        {cat._count && <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{cat._count.products} ürün</span>}
                        {cat.children && cat.children.length > 0 && <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">{cat.children.length} alt kategori</span>}
                    </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${cat.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {cat.active ? 'Aktif' : 'Pasif'}
                </span>
                <button onClick={() => setEditing({ ...cat })} className="text-xs text-neutral-500 hover:text-black">Düzenle</button>
                <button onClick={() => remove(cat)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
            </div>
            {cat.children && cat.children.map(child => renderCategory(child, depth + 1))}
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
                    <p className="text-sm text-neutral-400 mt-1">Veritabanı bağlantılı kategori yönetimi</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={seed} className="border border-neutral-300 text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-neutral-50">🌱 Seed</button>
                    <button onClick={() => setEditing(newCategory())} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">+ Yeni Kategori</button>
                </div>
            </div>

            {/* Toast */}
            {msg && (
                <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>
                    {msg}
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="font-bold text-lg">{editing.id === 'new' ? 'Yeni Kategori' : 'Kategori Düzenle'}</h2>
                            <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">İsim</label>
                                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="Plaka Yüklemeli Aletler" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Slug (URL)</label>
                                <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="plaka-yuklemeli" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Üst Kategori</label>
                                <select
                                    value={editing.parentId || ''}
                                    onChange={e => setEditing({ ...editing, parentId: e.target.value || null })}
                                    className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black"
                                >
                                    <option value="">Ana Kategori (Kök)</option>
                                    {flatCategories.filter(c => c.id !== editing.id).map(c => (
                                        <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Sıra</label>
                                <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" />
                            </div>
                            <ImageUpload value={editing.image || ''} onChange={url => setEditing({ ...editing, image: url })} folder="categories" label="Kategori Görseli" />
                            <div className="flex items-center gap-3">
                                <button onClick={() => setEditing({ ...editing, active: !editing.active })} className={`relative w-10 h-5 rounded-full transition-colors ${editing.active ? 'bg-green-500' : 'bg-neutral-300'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-sm">{editing.active ? 'Aktif' : 'Pasif'}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 sticky bottom-0 bg-white rounded-b-xl">
                            <button onClick={() => setEditing(null)} className="text-xs uppercase tracking-wider px-5 py-2.5 border border-neutral-300 rounded hover:bg-neutral-50">İptal</button>
                            <button onClick={save} className="text-xs uppercase tracking-wider px-6 py-2.5 bg-black text-white rounded hover:bg-neutral-800 font-semibold">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                    <p className="text-sm mb-3">Henüz kategori yok.</p>
                    <button onClick={seed} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800">🌱 Varsayılan Verileri Yükle</button>
                </div>
            ) : (
                <div className="space-y-2">
                    {categories.map(cat => renderCategory(cat))}
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
