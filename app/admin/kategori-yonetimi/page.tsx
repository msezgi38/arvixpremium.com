'use client';

import { useState, useEffect, useCallback } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    oldName: string | null;
    image: string | null;
    active: boolean;
    order: number;
    parentId: string | null;
    _count?: { products: number; children: number };
    children?: Category[];
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function KategoriYonetimi() {
    const [tree, setTree] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [newCat, setNewCat] = useState({ name: '', slug: '', parentId: '', image: '' });
    const [showAdd, setShowAdd] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const load = useCallback(() => {
        fetch('/api/db/categories?tree=true', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setTree(data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleAdd = async () => {
        if (!newCat.name) return;
        const slug = newCat.slug || slugify(newCat.name);
        const res = await fetch('/api/db/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newCat, slug, parentId: newCat.parentId || null }),
        });
        if (res.ok) {
            setMsg('Kategori eklendi!');
            setNewCat({ name: '', slug: '', parentId: '', image: '' });
            setShowAdd(false);
            load();
            setTimeout(() => setMsg(''), 3000);
        } else {
            const err = await res.json();
            setMsg('Hata: ' + (err.detail || err.error));
        }
    };

    const handleUpdate = async () => {
        if (!editCat) return;
        const res = await fetch('/api/db/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editCat),
        });
        if (res.ok) {
            setMsg('Güncellendi!');
            setEditCat(null);
            load();
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" kategorisi ve tüm alt kategorileri silinecek. Emin misiniz?`)) return;
        const res = await fetch(`/api/db/categories?id=${id}`, { method: 'DELETE' });
        if (res.ok) { setMsg('Silindi!'); load(); setTimeout(() => setMsg(''), 3000); }
    };

    const handleSeed = async () => {
        if (!confirm('Veritabanını varsayılan verilerle doldurmak istiyor musunuz?')) return;
        setMsg('Seed çalışıyor...');
        const res = await fetch('/api/db/seed', { method: 'POST' });
        const data = await res.json();
        setMsg(data.message || `${data.categories} kategori, ${data.products} ürün eklendi`);
        load();
        setTimeout(() => setMsg(''), 5000);
    };

    // Flatten tree for parent selector
    const flatList: { id: string; name: string; depth: number }[] = [];
    const flatten = (cats: Category[], depth = 0) => {
        for (const c of cats) {
            flatList.push({ id: c.id, name: c.name, depth });
            if (c.children) flatten(c.children, depth + 1);
        }
    };
    flatten(tree);

    const renderTree = (cats: Category[], depth = 0) => {
        return cats.map(cat => (
            <div key={cat.id} style={{ marginLeft: depth * 24 + 'px' }}>
                <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-neutral-50 group ${!cat.active ? 'opacity-50' : ''}`}>
                    {cat.children && cat.children.length > 0 ? (
                        <button onClick={() => toggleExpand(cat.id)} className="text-neutral-400 hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expanded.has(cat.id) ? 'rotate-90' : ''}`}><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    ) : (
                        <span className="w-4 h-4 flex items-center justify-center text-neutral-300">•</span>
                    )}

                    <span className={`font-semibold text-sm ${depth === 0 ? 'text-black uppercase tracking-wider' : depth === 1 ? 'text-neutral-700' : 'text-neutral-500 text-xs'}`}>
                        {cat.name}
                    </span>
                    <span className="text-xs text-neutral-400">/{cat.slug}</span>

                    {cat._count && (
                        <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                            {cat._count.children > 0 ? `${cat._count.children} alt` : ''}
                            {cat._count.products > 0 ? ` ${cat._count.products} ürün` : ''}
                        </span>
                    )}

                    <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditCat({ ...cat })} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded">Düzenle</button>
                        <button onClick={() => { setNewCat({ name: '', slug: '', parentId: cat.id, image: '' }); setShowAdd(true); }} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded">+ Alt</button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded">Sil</button>
                    </div>
                </div>
                {expanded.has(cat.id) && cat.children && cat.children.length > 0 && (
                    <div>{renderTree(cat.children, depth + 1)}</div>
                )}
            </div>
        ));
    };

    if (loading) return <div className="p-8 text-center text-neutral-400">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
                <div className="flex gap-2">
                    <button onClick={handleSeed} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded font-medium">
                        🌱 Seed Veritabanı
                    </button>
                    <button onClick={() => { setNewCat({ name: '', slug: '', parentId: '', image: '' }); setShowAdd(true); }} className="text-xs bg-black text-white px-4 py-2 rounded font-medium hover:bg-neutral-800">
                        + Yeni Kategori
                    </button>
                </div>
            </div>

            {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 text-sm">{msg}</div>}

            {/* Add Form */}
            {showAdd && (
                <div className="border border-neutral-200 rounded-lg p-4 mb-6 bg-neutral-50">
                    <h3 className="font-semibold text-sm mb-3">Yeni Kategori Ekle</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-neutral-500 block mb-1">Ad</label>
                            <input value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: slugify(e.target.value) })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 block mb-1">Slug</label>
                            <input value={newCat.slug} onChange={e => setNewCat({ ...newCat, slug: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 block mb-1">Üst Kategori</label>
                            <select value={newCat.parentId} onChange={e => setNewCat({ ...newCat, parentId: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm">
                                <option value="">Ana Kategori (Kök)</option>
                                {flatList.map(f => (
                                    <option key={f.id} value={f.id}>{'—'.repeat(f.depth)} {f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 block mb-1">Görsel URL</label>
                            <input value={newCat.image} onChange={e => setNewCat({ ...newCat, image: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" placeholder="/uploads/..." />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={handleAdd} className="text-xs bg-black text-white px-4 py-2 rounded hover:bg-neutral-800">Ekle</button>
                        <button onClick={() => setShowAdd(false)} className="text-xs bg-neutral-200 px-4 py-2 rounded hover:bg-neutral-300">İptal</button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editCat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="font-semibold mb-4">Kategori Düzenle</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 block mb-1">Ad</label>
                                <input value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 block mb-1">Slug</label>
                                <input value={editCat.slug} onChange={e => setEditCat({ ...editCat, slug: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 block mb-1">Sıra</label>
                                <input type="number" value={editCat.order} onChange={e => setEditCat({ ...editCat, order: parseInt(e.target.value) || 0 })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 block mb-1">Görsel URL</label>
                                <input value={editCat.image || ''} onChange={e => setEditCat({ ...editCat, image: e.target.value })} className="w-full border border-neutral-300 rounded px-3 py-2 text-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={editCat.active} onChange={e => setEditCat({ ...editCat, active: e.target.checked })} id="active" />
                                <label htmlFor="active" className="text-sm">Aktif</label>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleUpdate} className="text-xs bg-black text-white px-4 py-2 rounded hover:bg-neutral-800">Kaydet</button>
                            <button onClick={() => setEditCat(null)} className="text-xs bg-neutral-200 px-4 py-2 rounded hover:bg-neutral-300">İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Tree */}
            <div className="border border-neutral-200 rounded-lg">
                <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Kategori Ağacı</p>
                </div>
                <div className="p-2">
                    {tree.length > 0 ? (
                        renderTree(tree)
                    ) : (
                        <div className="text-center py-8 text-neutral-400">
                            <p className="mb-2">Henüz kategori yok.</p>
                            <p className="text-xs">Yukarıdaki &quot;Seed Veritabanı&quot; butonuna tıklayarak varsayılan verileri yükleyin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
