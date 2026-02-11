'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    oldName?: string;
    description?: string;
    image: string;
    active: boolean;
}

interface Subcategory {
    id: string;
    name: string;
    code?: string;
    oldName?: string;
    image: string;
    active: boolean;
}

interface CategoryData {
    hero: { title: string; subtitle: string; image: string };
    products?: Product[];
    subcategories?: Subcategory[];
    series?: Subcategory[];
    categories?: Subcategory[];
}

const validSlugs = [
    'plaka-yuklemeli', 'pinli-aletler', 'kardiyo',
    'istasyonlar', 'sehpa-bench', 'aksesuarlar', 'yeni-urunler',
];

export default function ProductCategoryPage() {
    const params = useParams();
    const slug = params.category as string;
    const [data, setData] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug || !validSlugs.includes(slug)) {
            setLoading(false);
            return;
        }
        fetch(`/products/${slug}.json`)
            .then((res) => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">Sayfa bulunamadı</p>
            </div>
        );
    }

    const items = data.products || data.subcategories || data.series || data.categories || [];
    const activeItems = items.filter((item) => item.active);

    return (
        <>
            {/* Hero */}
            <section className="relative min-h-[400px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.hero.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.hero.image} alt="" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{data.hero.title}</h1>
                    <p className="text-lg md:text-xl text-white/70">{data.hero.subtitle}</p>
                    <p className="mt-4 text-sm text-white/50">
                        {activeItems.length} ürün
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    {activeItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeItems.map((item) => (
                                <Link key={item.id} href={`/urunler/${slug}/${item.id.toLowerCase()}`} className="group border border-neutral-200 bg-white hover:shadow-lg transition-shadow duration-300">
                                    <div className="aspect-square bg-neutral-100 overflow-hidden">
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-base font-bold uppercase tracking-wider">{item.name}</h3>
                                        {'code' in item && (item as Subcategory).code && (
                                            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">{(item as Subcategory).code}</p>
                                        )}
                                        {'oldName' in item && item.oldName && (
                                            <p className="text-xs text-neutral-400 mt-1">Eski: {item.oldName}</p>
                                        )}
                                        {'description' in item && (item as Product).description && (
                                            <p className="text-sm text-neutral-600 mt-2">{(item as Product).description}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-neutral-500">
                            <p className="text-lg mb-4">Bu kategoride henüz ürün bulunmuyor.</p>
                            <p className="text-sm">Admin panelinden ürün ekleyebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Teklif Almak İster Misiniz?</h2>
                    <p className="text-neutral-400 mb-8">Bu ürünler hakkında detaylı bilgi ve fiyat teklifi için bizimle iletişime geçin.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/iletisim" className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            Teklif Al
                        </Link>
                        <Link href="/marka-logo" className="inline-block border border-white text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-white hover:text-black transition-colors">
                            Marka & Logo
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
