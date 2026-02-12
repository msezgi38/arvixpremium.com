'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomSection {
    id: number;
    title: string;
    description: string;
    image: string;
    images: string[];
}

interface GalleryItem {
    id: number;
    image: string;
    title: string;
}

interface BrandData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    intro: { title: string; paragraphs: string[] };
    sections: CustomSection[];
    gallery: GalleryItem[];
    cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
    // legacy compat
    content?: { title: string; paragraphs: string[]; image: string };
    features?: { id: number; title: string; description: string; image: string }[];
}

export default function MarkaLogoPage() {
    const [data, setData] = useState<BrandData | null>(null);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/db/settings?key=brand', { cache: 'no-store' })
            .then((res) => res.json())
            .then((d) => {
                if (d && Object.keys(d).length > 0) setData(d);
                else return fetch('/brand/brand.json').then(r => r.json()).then(setData);
            })
            .catch(() => {
                fetch('/brand/brand.json').then(r => r.json()).then(setData).catch(() => setData(null));
            });
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Backward compat: if old format, use content/features as fallback
    const intro = data.intro || (data.content ? { title: data.content.title, paragraphs: data.content.paragraphs } : { title: '', paragraphs: [] });
    const sections = data.sections || (data.features ? data.features.map(f => ({ ...f, images: f.image ? [f.image] : [] })) : []);
    const gallery = data.gallery || [];

    return (
        <>
            {/* Hero */}
            <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.hero?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.hero.image} alt="" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${data.hero?.overlayOpacity ?? 0.6})` }} />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-block mb-6 px-4 py-1.5 border border-white/30 rounded-full">
                        <span className="text-xs uppercase tracking-[3px] text-white/70">Arvix Premium</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">{data.hero?.title || 'Kendi Marka ve Logonu Oluştur'}</h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">{data.hero?.subtitle || ''}</p>
                    <div className="mt-10">
                        <Link href={data.cta?.buttonLink || '/iletisim'} className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            {data.cta?.buttonText || 'Teklif Al'}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Intro */}
            {intro.title && (
                <section className="py-20 md:py-28 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">{intro.title}</h2>
                        {intro.paragraphs.map((para, i) => {
                            const parts = para.split(/\*\*(.*?)\*\*/g);
                            return (
                                <p key={i} className="text-base md:text-lg text-neutral-600 leading-relaxed mb-4 max-w-3xl mx-auto">
                                    {parts.map((part, k) =>
                                        k % 2 === 1 ? <strong key={k} className="text-neutral-800">{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Customization Sections */}
            {sections.map((section, idx) => {
                const isReversed = idx % 2 === 1;
                const hasMultipleImages = section.images && section.images.length > 1;

                return (
                    <section key={section.id} className={`py-20 md:py-28 ${idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}>
                        <div className="max-w-6xl mx-auto px-6">
                            {/* Section header */}
                            <div className="text-center mb-12">
                                <div className="inline-block mb-3 w-12 h-0.5 bg-black" />
                                <h2 className="text-3xl md:text-4xl font-bold">{section.title}</h2>
                            </div>

                            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}>
                                {/* Text side */}
                                <div className={`${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                                    <p className="text-base md:text-lg text-neutral-600 leading-relaxed whitespace-pre-line">
                                        {section.description}
                                    </p>
                                    <div className="mt-8">
                                        <Link href={data.cta?.buttonLink || '/iletisim'} className="inline-block border-2 border-black text-black text-xs uppercase tracking-[2px] font-semibold px-6 py-3 hover:bg-black hover:text-white transition-all duration-300">
                                            Detaylı Bilgi Al
                                        </Link>
                                    </div>
                                </div>

                                {/* Image side */}
                                <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                                    {hasMultipleImages ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {section.images.map((img, imgIdx) => (
                                                <div
                                                    key={imgIdx}
                                                    className={`overflow-hidden rounded-lg cursor-pointer group ${imgIdx === 0 && section.images.length === 3 ? 'col-span-2' : ''}`}
                                                    onClick={() => setLightbox(img)}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img}
                                                        alt={`${section.title} ${imgIdx + 1}`}
                                                        className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg cursor-pointer group" onClick={() => section.image && setLightbox(section.image)}>
                                            {(section.image || (section.images && section.images[0])) && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={section.image || section.images[0]}
                                                    alt={section.title}
                                                    className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* Product Gallery */}
            {gallery.length > 0 && (
                <section className="py-20 md:py-28 bg-neutral-900 text-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <div className="inline-block mb-3 w-12 h-0.5 bg-white/50" />
                            <h2 className="text-3xl md:text-4xl font-bold">Ekipman Koleksiyonu</h2>
                            <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">Tüm ekipmanlarınız markanıza özel olarak tasarlanır ve üretilir.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.map((item) => (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer"
                                    onClick={() => item.image && setLightbox(item.image)}
                                >
                                    <div className="aspect-square bg-neutral-800 overflow-hidden rounded-lg">
                                        {item.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        )}
                                    </div>
                                    {item.title && (
                                        <p className="text-sm text-neutral-400 mt-2 text-center group-hover:text-white transition-colors">{item.title}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-24 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">{data.cta?.title || 'Markanızı Ekipmanlarınıza Taşıyın'}</h2>
                    <p className="text-neutral-400 mb-10 text-lg">{data.cta?.subtitle || ''}</p>
                    {data.cta?.buttonText && (
                        <Link href={data.cta.buttonLink || '/iletisim'} className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-10 py-4 hover:bg-neutral-200 transition-colors">
                            {data.cta.buttonText}
                        </Link>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-light z-10"
                        onClick={() => setLightbox(null)}
                    >
                        ✕
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightbox}
                        alt=""
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
