'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Feature {
    id: number;
    title: string;
    description: string;
    image: string;
}

interface BrandData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    content: { title: string; paragraphs: string[]; image: string };
    features: Feature[];
    cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
}

export default function MarkaLogoPage() {
    const [data, setData] = useState<BrandData | null>(null);

    useEffect(() => {
        fetch('/brand/brand.json')
            .then((res) => res.json())
            .then(setData)
            .catch(() => setData(null));
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Hero */}
            <section className="relative min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.hero.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.hero.image} alt="" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${data.hero.overlayOpacity})` }} />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{data.hero.title}</h1>
                    <p className="text-lg md:text-xl text-white/70">{data.hero.subtitle}</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className={`grid grid-cols-1 ${data.content.image ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-8">{data.content.title}</h2>
                            {data.content.paragraphs.map((para, i) => (
                                <p key={i} className="text-base md:text-lg text-neutral-600 leading-relaxed mb-4">{para}</p>
                            ))}
                        </div>
                        {data.content.image && (
                            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={data.content.image} alt={data.content.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            {data.features.length > 0 && (
                <section className="py-20 md:py-28 bg-neutral-50">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.features.map((feature) => (
                                <div key={feature.id} className="group">
                                    <div className="aspect-[4/3] bg-neutral-200 overflow-hidden mb-4">
                                        {feature.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 bg-black text-white">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.cta.title}</h2>
                    <p className="text-neutral-400 mb-8">{data.cta.subtitle}</p>
                    {data.cta.buttonText && (
                        <Link href={data.cta.buttonLink || '/iletisim'} className="inline-block bg-white text-black text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-200 transition-colors">
                            {data.cta.buttonText}
                        </Link>
                    )}
                </div>
            </section>
        </>
    );
}
