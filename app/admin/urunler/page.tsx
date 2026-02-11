'use client';

import { useState, useEffect, useMemo } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

const categoryList = [
    { slug: 'plaka-yuklemeli', name: 'Plaka Yüklemeli Aletler', icon: 'M12 2v20M2 12h20M6 6l12 12M18 6 6 18' },
    { slug: 'pinli-aletler', name: 'Pinli (Selectorized) Aletler', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { slug: 'kardiyo', name: 'Kardiyo Aletleri', icon: 'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z' },
    { slug: 'istasyonlar', name: 'İstasyonlar', icon: 'M2 20h20M5 20V8l7-5 7 5v12M9 20v-5h6v5' },
    { slug: 'sehpa-bench', name: 'Sehpa & Bench', icon: 'M5 12h14M12 5v14' },
    { slug: 'aksesuarlar', name: 'Aksesuarlar', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { slug: 'yeni-urunler', name: 'Yeni Ürünler', icon: 'M12 2 L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z' },
];

interface Product { id: string; name: string; oldName?: string; description?: string; image: string; active: boolean; }
interface CatData { hero: { title: string; subtitle: string; image: string }; products?: Product[]; subcategories?: Product[]; series?: Product[]; categories?: Product[]; }

export default function UrunlerAdmin() {
    const [selected, setSelected] = useState(categoryList[0].slug);
    const [data, setData] = useState<CatData | null>(null);
    const [editing, setEditing] = useState<Product | null>(null);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');
    const [heroOpen, setHeroOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        fetch(`/api/products/${selected}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setData(null); setLoading(false); });
    };
    useEffect(() => { load(); setEditing(null); setSearch(''); setHeroOpen(false); }, [selected]); // eslint-disable-line

    const getItems = (): Product[] => data?.products || data?.subcategories || data?.series || data?.categories || [];
    const getItemsKey = (): string => data?.products ? 'products' : data?.subcategories ? 'subcategories' : data?.series ? 'series' : data?.categories ? 'categories' : 'products';

    const filteredItems = useMemo(() => {
        const items = getItems();
        if (!search) return items;
        const q = search.toLowerCase();
        return items.filter(i => i.name.toLowerCase().includes(q) || i.oldName?.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }, [data, search]); // eslint-disable-line

    const stats = useMemo(() => {
        const items = getItems();
        return { total: items.length, active: items.filter(i => i.active).length, passive: items.filter(i => !i.active).length };
    }, [data]); // eslint-disable-line

    const flashMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

    const save = async () => {
        if (!data || !editing) return;
        const key = getItemsKey();
        const items = [...getItems()];
        const idx = items.findIndex(p => p.id === editing.id);
        if (idx >= 0) items[idx] = editing;
        else items.push(editing);
        const updated = { ...data, [key]: items };
        const res = await fetch(`/api/products/${selected}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
        if (res.ok) { flashMsg('✓ Ürün kaydedildi'); setEditing(null); setData(updated); }
    };

    const remove = async (id: string) => {
        if (!data || !confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        const key = getItemsKey();
        const items = getItems().filter(p => p.id !== id);
        const updated = { ...data, [key]: items };
        await fetch(`/api/products/${selected}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
        setData(updated);
        flashMsg('Ürün silindi');
    };

    const toggleActive = async (item: Product) => {
        if (!data) return;
        const key = getItemsKey();
        const items = getItems().map(i => i.id === item.id ? { ...i, active: !i.active } : i);
        const updated = { ...data, [key]: items };
        await fetch(`/api/products/${selected}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
        setData(updated);
    };

    const saveHero = async () => {
        if (!data) return;
        const res = await fetch(`/api/products/${selected}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) flashMsg('✓ Hero kaydedildi');
    };

    const selectedCat = categoryList.find(c => c.slug === selected)!;

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Ürün Yönetimi</h1>
                <p className="text-sm text-neutral-400 mt-1">Kategorilere göre ürünleri yönetin, düzenleyin ve yayınlayın.</p>
            </div>

            {/* Toast */}
            {msg && (
                <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right" style={{ animation: 'slideIn .3s ease-out' }}>
                    {msg}
                </div>
            )}

            {/* Category Sidebar + Content */}
            <div className="flex gap-6">
                {/* Category Nav */}
                <div className="w-56 flex-shrink-0">
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden sticky top-24">
                        <div className="px-4 py-3 border-b border-neutral-100">
                            <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-semibold">Kategoriler</p>
                        </div>
                        <div className="py-1">
                            {categoryList.map(cat => (
                                <button
                                    key={cat.slug}
                                    onClick={() => setSelected(cat.slug)}
                                    className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${selected === cat.slug
                                            ? 'bg-black text-white font-semibold'
                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : data && (
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

                            {/* Hero Section Toggle */}
                            <div className="bg-white border border-neutral-200 rounded-lg mb-6 overflow-hidden">
                                <button onClick={() => setHeroOpen(!heroOpen)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                        <span className="text-sm font-semibold">Hero Bölümü</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">{selectedCat.name}</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${heroOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                                {heroOpen && (
                                    <div className="px-5 pb-5 border-t border-neutral-100 pt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Başlık</label>
                                                <input value={data.hero?.title || ''} onChange={e => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border border-neutral-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Alt Başlık</label>
                                                <input value={data.hero?.subtitle || ''} onChange={e => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border border-neutral-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors" />
                                            </div>
                                        </div>
                                        <ImageUpload value={data.hero?.image || ''} onChange={url => setData({ ...data, hero: { ...data.hero, image: url } })} folder={`products/${selected}`} label="Hero Görseli" />
                                        <div className="flex justify-end">
                                            <button onClick={saveHero} className="bg-black text-white text-xs uppercase tracking-wider px-6 py-2.5 rounded hover:bg-neutral-800 transition-colors">
                                                Hero Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-4 gap-4">
                                <div className="relative flex-1 max-w-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Ürün ara..."
                                        className="w-full border border-neutral-200 rounded pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={() => setEditing({ id: `new-${Date.now()}`, name: '', oldName: '', description: '', image: '', active: true })}
                                    className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1.5 flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                                    Yeni Ürün
                                </button>
                            </div>

                            {/* Product Grid */}
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-16 text-neutral-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    <p className="text-sm">{search ? 'Arama sonucu bulunamadı' : 'Bu kategoride henüz ürün yok'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {filteredItems.map(item => (
                                        <div key={item.id} className={`bg-white border rounded-lg overflow-hidden group transition-all hover:shadow-md ${item.active ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
                                            {/* Image */}
                                            <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                                                {item.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                    </div>
                                                )}
                                                {/* Status Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded ${item.active ? 'bg-green-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                                                        {item.active ? 'Aktif' : 'Pasif'}
                                                    </span>
                                                </div>
                                                {/* Actions overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => setEditing({ ...item })} className="bg-white text-black text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded hover:bg-neutral-200 transition-colors">
                                                        Düzenle
                                                    </button>
                                                    <button onClick={() => toggleActive(item)} className="bg-white/90 text-black text-[10px] uppercase tracking-wider font-semibold px-3 py-2 rounded hover:bg-white transition-colors">
                                                        {item.active ? 'Pasife Al' : 'Aktif Et'}
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-sm truncate">{item.name}</h3>
                                                        {item.oldName && <p className="text-[11px] text-neutral-400 truncate mt-0.5">Eski: {item.oldName}</p>}
                                                        {item.description && <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{item.description}</p>}
                                                    </div>
                                                    <button onClick={() => remove(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5" title="Sil">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{item.id}</span>
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
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="font-bold text-lg">{editing.id.startsWith('new-') ? 'Yeni Ürün Ekle' : 'Ürün Düzenle'}</h2>
                            <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-black transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Ürün Kodu / Adı</label>
                                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ör: PL1, BK-300..." className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Eski Adı</label>
                                <input value={editing.oldName || ''} onChange={e => setEditing({ ...editing, oldName: e.target.value })} placeholder="Opsiyonel" className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-[2px] text-neutral-400 mb-1.5">Açıklama</label>
                                <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} placeholder="Ürün açıklaması..." className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-colors resize-none" />
                            </div>
                            <ImageUpload value={editing.image} onChange={url => setEditing({ ...editing, image: url })} folder={`products/${selected}`} label="Ürün Görseli" />
                            <div className="flex items-center gap-3">
                                <button onClick={() => setEditing({ ...editing, active: !editing.active })} className={`relative w-10 h-5 rounded-full transition-colors ${editing.active ? 'bg-green-500' : 'bg-neutral-300'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-sm">{editing.active ? 'Aktif' : 'Pasif'}</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 sticky bottom-0 bg-white rounded-b-xl">
                            <button onClick={() => setEditing(null)} className="text-xs uppercase tracking-wider px-5 py-2.5 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors">
                                İptal
                            </button>
                            <button onClick={save} className="text-xs uppercase tracking-wider px-6 py-2.5 bg-black text-white rounded hover:bg-neutral-800 transition-colors font-semibold">
                                Kaydet
                            </button>
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
