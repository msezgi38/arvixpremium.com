'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MimariData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    content: {
        title: string;
        description: string;
        features: { title: string; description: string }[];
        image: string;
    };
    process: {
        title: string;
        subtitle: string;
        steps: { title: string; description: string }[];
    };
    cta: { title: string; subtitle: string; buttonText: string; buttonLink: string; image: string };
}

const defaultData: MimariData = {
    hero: {
        title: 'Mimari Yerleşim Planı Desteği',
        subtitle: 'Mimari planınızı gönderin; uzman mimarlarımız ekipmanlarınız için en doğru yerleşim planını hazırlasın.',
        image: '',
        overlayOpacity: 0.6,
    },
    content: {
        title: 'Profesyonel Yerleşim Planlaması',
        description: 'Ekipman satışına ek olarak, mimar tarafından yapılan bu planlama; alan verimliliği, doğru dolaşım ve maksimum kullanım kapasitesi hedeflenerek gerçekleştirilir. Kardiyo, ağırlık ve fonksiyonel alanlar salonunuza özel olarak optimize edilir.',
        features: [
            { title: 'Alan Verimliliği', description: 'Mevcut alanınızın her metrekaresini en verimli şekilde kullanma.' },
            { title: 'Doğru Dolaşım', description: 'Kullanıcı akışını optimize eden, güvenli ve ergonomik yerleşim planı.' },
            { title: 'Maksimum Kapasite', description: 'En fazla ekipmanı en doğru şekilde yerleştirerek kapasitenizi artırın.' },
            { title: 'Alanların Optimizasyonu', description: 'Kardiyo, ağırlık ve fonksiyonel alanlar salonunuza özel olarak optimize edilir.' },
        ],
        image: '',
    },
    process: {
        title: 'Nasıl Çalışır?',
        subtitle: 'Yerleşim planı desteği sürecimiz 3 basit adımdan oluşur.',
        steps: [
            { title: 'Mimari Planı Gönderin', description: 'Salonunuzun mimari planını ya da ölçülü krokisini bize iletin.' },
            { title: 'Uzman İncelemesi', description: 'Mimarlarımız planınızı inceleyerek en uygun ekipman yerleşimini hazırlar.' },
            { title: 'Yerleşim Planı Teslimi', description: 'Hazırlanan profesyonel yerleşim planı sizinle paylaşılır.' },
        ],
    },
    cta: {
        title: 'Doğru ekipman. Doğru mimari planlama.',
        subtitle: 'Yatırımınızdan maksimum verim.',
        buttonText: 'İletişime Geçin',
        buttonLink: '/iletisim',
        image: '',
    },
};

export default function MimariPlanlamaPage() {
    const [data, setData] = useState<MimariData | null>(null);

    useEffect(() => {
        fetch('/api/db/settings?key=mimari-planlama', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => {
                if (d && Object.keys(d).length > 0) {
                    setData({
                        hero: { ...defaultData.hero, ...d.hero },
                        content: { ...defaultData.content, ...d.content, features: d.content?.features || defaultData.content.features },
                        process: { ...defaultData.process, ...d.process, steps: d.process?.steps || defaultData.process.steps },
                        cta: { ...defaultData.cta, ...d.cta },
                    });
                } else {
                    setData(defaultData);
                }
            })
            .catch(() => setData(defaultData));
    }, []);

    if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

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
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{data.hero.title}</h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">{data.hero.subtitle}</p>
                </div>
            </section>

            {/* Content + Image */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.content.title}</h2>
                            <p className="text-neutral-600 leading-relaxed mb-8">{data.content.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.content.features.map((f, i) => (
                                    <div key={i} className="p-5 bg-neutral-50 border border-neutral-100">
                                        <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-xs font-bold mb-3">{i + 1}</div>
                                        <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                                        <p className="text-xs text-neutral-500">{f.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="aspect-square bg-neutral-100 overflow-hidden">
                            {data.content.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={data.content.image} alt="Mimari Yerleşim Planı" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Steps */}
            <section className="py-20 md:py-28 bg-neutral-950 text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">{data.process.title}</h2>
                        <p className="text-neutral-400 text-base md:text-lg">{data.process.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.process.steps.map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">{i + 1}</div>
                                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                                <p className="text-neutral-400 text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-neutral-50">
                    {data.cta.image && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.cta.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60" />
                        </>
                    )}
                </div>
                <div className={`relative z-10 max-w-3xl mx-auto px-6 text-center ${data.cta.image ? 'text-white' : ''}`}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">{data.cta.title}</h2>
                    <p className={`text-lg mb-8 ${data.cta.image ? 'text-white/70' : 'text-neutral-500'}`}>{data.cta.subtitle}</p>
                    <Link href={data.cta.buttonLink} className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors">
                        {data.cta.buttonText}
                    </Link>
                </div>
            </section>
        </>
    );
}
