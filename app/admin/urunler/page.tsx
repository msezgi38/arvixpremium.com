'use client';

import { useState, useEffect, useMemo } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
    id: string;
    name: string;
    slug: string;
    children?: Category[];
}

interface Product {
    id: string;
    name: string;
    slug: string;
    oldName?: string;
    newName?: string;
    description?: string;
    image?: string;
    active: boolean;
    order: number;
    categoryId: string;
    images?: { id: string; url: string }[];
}

export default function UrunlerAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string>('');
    const [selectedCatName, setSelectedCatName] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [editing, setEditing] = useState<Product | null>(null);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Load categories tree
    useEffect(() => {
        fetch('/api/db/categories?tree=true', { cache: 'no-store' })
            .then(r => r.json())
            .then((data: Category[]) => {
                if (Array.isArray(data)) {
                    setCategories(data);
                    // Auto-select first leaf category
                    if (data.length > 0) {
                        const first = data[0];
                        if (first.children && first.children.length > 0) {
                            setSelectedCatId(first.children[0].id);
                            setSelectedCatName(first.children[0].name);
                        } else {
                            setSelectedCatId(first.id);
                            setSelectedCatName(first.name);
                        }
                    }
                }
            })
            .catch(() => setCategories([]));
    }, []);

    // Load products when category changes
    useEffect(() => {
        if (!selectedCatId) return;
        setLoading(true);
        fetch(`/api/db/products?categoryId=${selectedCatId}`, { cache: 'no-store' })
            .then(r => r.json())
            .then((data: Product[]) => {
                if (Array.isArray(data)) setProducts(data);
                else setProducts([]);
                setLoading(false);
            })
            .catch(() => { setProducts([]); setLoading(false); });
    }, [selectedCatId]);

    const filteredProducts = useMemo(() => {
        if (!search) return products;
        const q = search.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(q) || p.oldName?.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }, [products, search]);

    const stats = useMemo(() => ({
        total: products.length,
        active: products.filter(p => p.active).length,
        passive: products.filter(p => !p.active).length,
    }), [products]);

    const flashMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

    const slugify = (text: string) => text.toLowerCase().replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const save = async () => {
        if (!editing || !selectedCatId) return;
        const isNew = editing.id === 'new';
        const method = isNew ? 'POST' : 'PUT';

        const body: Record<string, unknown> = {
            name: editing.name,
            slug: editing.slug || slugify(editing.name),
            oldName: editing.oldName || null,
            newName: editing.newName || null,
            description: editing.description || null,
            image: editing.image || null,
            active: editing.active,
            order: editing.order,
            categoryId: selectedCatId,
        };
        if (!isNew) body.id = editing.id;

        const res = await fetch('/api/db/products', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            flashMsg(isNew ? '✓ Ürün eklendi' : '✓ Ürün güncellendi');
            setEditing(null);
            // Reload products
            const updated = await fetch(`/api/db/products?categoryId=${selectedCatId}`, { cache: 'no-store' }).then(r => r.json());
            if (Array.isArray(updated)) setProducts(updated);
        } else {
            const err = await res.json();
            flashMsg('Hata: ' + (err.error || 'Bilinmeyen hata'));
        }
    };

    const remove = async (product: Product) => {
        if (!confirm(`"${product.name}" silinecek. Emin misiniz?`)) return;
        await fetch(`/api/db/products?id=${product.id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== product.id));
        flashMsg('Ürün silindi');
    };

    const toggleActive = async (product: Product) => {
        const res = await fetch('/api/db/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id, active: !product.active }),
        });
        if (res.ok) {
            setProducts(products.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
        }
    };

    const newProduct = (): Product => ({
        id: 'new', name: '', slug: '', oldName: '', description: '', image: '', active: true, order: products.length + 1, categoryId: selectedCatId,
    });

    const selectCategory = (cat: Category) => {
        setSelectedCatId(cat.id);
        setSelectedCatName(cat.name);
        setEditing(null);
        setSearch('');
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Ürün Yönetimi</h1>
                <p className="text-sm text-neutral-400 mt-1">Veritabanı bağlantılı ürün yönetimi. Kategoriye göre ürünleri düzenleyin.</p>
            </div>

            {/* Toast */}
            {msg && (
                <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg" style={{ animation: 'slideIn .3s ease-out' }}>
                    {msg}
                </div>
            )}

            {/* Category Sidebar + Content */}
            <div className="flex gap-6">
                {/* Category Nav */}
                <div className="w-60 flex-shrink-0">
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden sticky top-24">
                        <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-semibold">Kategoriler</p>
                        </div>
                        <div className="py-1 max-h-[70vh] overflow-y-auto">
                            {categories.map(mainCat => (
                                <div key={mainCat.id}>
                                    <button
                                        onClick={() => selectCategory(mainCat)}
                                        className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${selectedCatId === mainCat.id ? 'bg-black text-white' : 'text-neutral-800 hover:bg-neutral-50'}`}
                                    >
                                        {mainCat.name}
                                    </button>
                                    {mainCat.children && mainCat.children.map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => selectCategory(sub)}
                                            className={`w-full text-left flex items-center gap-2 pl-8 pr-4 py-2 text-xs transition-all ${selectedCatId === sub.id ? 'bg-black text-white font-semibold' : 'text-neutral-500 hover:bg-neutral-50 hover:text-black'}`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="px-4 py-6 text-xs text-neutral-400 text-center">Kategori bulunamadı. Önce kategori ekleyin.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {!selectedCatId ? (
                        <div className="text-center py-20 text-neutral-400">
                            <p>Bir kategori seçin</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-white border border-neutral-200 rounded-lg px-5 py-4">
                                    <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-semibold">Toplam</p>
                                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-lg px-5 py-4">
                                    <p className="text-[10px] uppercase tracking-[2px] text-green-500 font-semibold">Aktif</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-lg px-5 py-4">
                                    <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-semibold">Pasif</p>
                                    <p className="text-2xl font-bold mt-1 text-neutral-400">{stats.passive}</p>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold">{selectedCatName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün ara..." className="border border-neutral-200 rounded pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-black w-52" />
                                    </div>
                                    <button onClick={() => setEditing(newProduct())} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 rounded hover:bg-neutral-800 flex items-center gap-1.5 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                                        Yeni Ürün
                                    </button>
                                </div>
                            </div>

                            {/* Product Grid */}
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-16 text-neutral-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    <p className="text-sm">{search ? 'Arama sonucu bulunamadı' : 'Bu kategoride henüz ürün yok'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {filteredProducts.map(item => (
                                        <div key={item.id} className={`bg-white border rounded-lg overflow-hidden group transition-all hover:shadow-md ${item.active ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
                                            <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                                                {(item.image || item.images?.[0]?.url) ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image || item.images?.[0]?.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded ${item.active ? 'bg-green-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                                                        {item.active ? 'Aktif' : 'Pasif'}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => setEditing({ ...item, image: item.image || item.images?.[0]?.url || '' })} className="bg-white text-black text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded hover:bg-neutral-200">Düzenle</button>
                                                    <button onClick={() => toggleActive(item)} className="bg-white/90 text-black text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded hover:bg-white">
                                                        {item.active ? 'Pasife Al' : 'Aktif Et'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-sm truncate">{item.name}</h3>
                                                        {item.oldName && <p className="text-[11px] text-neutral-400 truncate mt-0.5">Eski: {item.oldName}</p>}
                                                        {item.description && <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{item.description}</p>}
                                                    </div>
                                                    <button onClick={() => remove(item)} className="text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5" title="Sil">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{item.slug}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="font-bold text-lg">{editing.id === 'new' ? 'Yeni Ürün Ekle' : 'Ürün Düzenle'}</h2>
                            <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Ürün Adı</label>
                                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Chest Press Machine" className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Slug (URL)</label>
                                <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="chest-press-machine" className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Eski Adı</label>
                                    <input value={editing.oldName || ''} onChange={e => setEditing({ ...editing, oldName: e.target.value })} placeholder="Opsiyonel" className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Sıra</label>
                                    <input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Açıklama</label>
                                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Ürün açıklaması..." className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" />
                            </div>
                            <ImageUpload value={editing.image || ''} onChange={url => setEditing({ ...editing, image: url })} folder="products" label="Ürün Görseli" />
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

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
