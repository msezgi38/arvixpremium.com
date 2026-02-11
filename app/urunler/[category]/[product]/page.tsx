'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    oldName?: string;
    description?: string;
    image: string;
    active: boolean;
    code?: string;
}

interface CategoryData {
    hero: { title: string; subtitle: string; image: string };
    products?: Product[];
    subcategories?: Product[];
    series?: Product[];
    categories?: Product[];
}

export default function ProductDetailPage() {
    const params = useParams();
    const category = params.category as string;
    const productId = params.product as string;
    const [catData, setCatData] = useState<CategoryData | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [siblings, setSiblings] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [qty, setQty] = useState(1);
    const { addItem } = useCart();

    useEffect(() => {
        if (!category || !productId) { setLoading(false); return; }
        fetch(`/products/${category}.json`)
            .then(r => r.json())
            .then((data: CategoryData) => {
                setCatData(data);
                const items = data.products || data.subcategories || data.series || data.categories || [];
                const active = items.filter(i => i.active);
                const found = active.find(i => i.id.toLowerCase() === productId.toLowerCase());
                setProduct(found || null);
                setSiblings(active.filter(i => i.id.toLowerCase() !== productId.toLowerCase()));
            })
            .catch(() => { setCatData(null); setProduct(null); })
            .finally(() => setLoading(false));
    }, [category, productId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product || !catData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-500 text-lg">Ürün bulunamadı</p>
                <Link href={`/urunler/${category}`} className="text-sm uppercase tracking-wider border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors">
                    Kategoriye Dön
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-neutral-50 border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link>
                        <span>/</span>
                        <Link href={`/urunler/${category}`} className="hover:text-black transition-colors">{catData.hero.title}</Link>
                        <span>/</span>
                        <span className="text-black font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Product Detail */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Image */}
                        <div className="aspect-square bg-neutral-100 overflow-hidden">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center">
                            <p className="text-xs uppercase tracking-[3px] text-neutral-400 mb-3">{catData.hero.title}</p>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
                            {product.oldName && (
                                <p className="text-sm text-neutral-400 mb-4">Eski Kod: <span className="font-medium text-neutral-600">{product.oldName}</span></p>
                            )}
                            {product.code && (
                                <p className="text-sm text-neutral-400 mb-4">Ürün Kodu: <span className="font-medium text-neutral-600">{product.code}</span></p>
                            )}
                            {product.description && (
                                <p className="text-base text-neutral-600 leading-relaxed mb-8">{product.description}</p>
                            )}

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-2">Adet</label>
                                <div className="flex items-center gap-0 w-fit">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors text-lg font-light">−</button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={qty}
                                        onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-16 h-11 border-t border-b border-neutral-300 text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button onClick={() => setQty(q => q + 1)} className="w-11 h-11 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors text-lg font-light">+</button>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        addItem({
                                            id: product.id,
                                            name: product.name,
                                            category: category,
                                            categoryName: catData.hero.title,
                                            image: product.image,
                                        }, qty);
                                        setAdded(true);
                                        setQty(1);
                                        setTimeout(() => setAdded(false), 2000);
                                    }}
                                    className={`text-xs uppercase tracking-[2px] font-semibold px-8 py-4 transition-all flex items-center gap-2 ${added ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}
                                >
                                    {added ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                            Eklendi!
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                            Sepete Ekle ({qty} Adet)
                                        </>
                                    )}
                                </button>
                                <Link href="/sepet" className="border border-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                    Sepete Git
                                </Link>
                                <Link href={`/urunler/${category}`} className="border border-neutral-300 text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:border-black transition-colors">
                                    Tüm {catData.hero.title}
                                </Link>
                            </div>

                            {/* Specs */}
                            <div className="mt-12 border-t border-neutral-200 pt-8">
                                <h3 className="text-xs uppercase tracking-[2px] font-bold mb-4">Özellikler</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Seri</p>
                                        <p className="font-semibold mt-1">{product.name}</p>
                                    </div>
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Kategori</p>
                                        <p className="font-semibold mt-1">{catData.hero.title}</p>
                                    </div>
                                    {product.oldName && (
                                        <div className="py-3 border-b border-neutral-100">
                                            <p className="text-neutral-400 text-xs uppercase tracking-wider">Eski Kod</p>
                                            <p className="font-semibold mt-1">{product.oldName}</p>
                                        </div>
                                    )}
                                    <div className="py-3 border-b border-neutral-100">
                                        <p className="text-neutral-400 text-xs uppercase tracking-wider">Durum</p>
                                        <p className="font-semibold mt-1 text-green-600">Aktif</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Other Products */}
            {siblings.length > 0 && (
                <section className="py-16 bg-neutral-50 border-t border-neutral-200">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-xl font-bold mb-8">Diğer {catData.hero.title}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {siblings.map(item => (
                                <Link key={item.id} href={`/urunler/${category}/${item.id.toLowerCase()}`} className="group border border-neutral-200 bg-white hover:shadow-md transition-all">
                                    <div className="aspect-square bg-neutral-100 overflow-hidden">
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 text-center">
                                        <p className="text-sm font-bold uppercase tracking-wider">{item.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Bu Ürün Hakkında Bilgi Alın</h2>
                    <p className="text-neutral-400 mb-8">Detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.</p>
                    <Link href="/sepet" className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                        Sepeti Görüntüle
                    </Link>
                </div>
            </section>
        </>
    );
}
