'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Section {
    id: number;
    title: string;
    content: string;
    list?: string[];
    image: string;
    imagePosition: string;
    order: number;
}

interface ValueItem {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface Stat {
    id: number;
    value: string;
    label: string;
}

interface AboutData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    intro: { title: string; paragraphs: string[]; image: string; buttonText: string; buttonLink: string };
    sections: Section[];
    mission: { title: string; content: string; image: string };
    values: ValueItem[];
    stats: Stat[];
}

function renderBold(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

const iconMap: Record<string, React.ReactNode> = {
    target: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    ),
    award: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
    ),
    heart: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
    ),
    star: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    ),
    shield: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
    ),
    users: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    zap: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
    ),
};

export default function AboutPage() {
    const [data, setData] = useState<AboutData | null>(null);

    useEffect(() => {
        fetch('/api/db/settings?key=about', { cache: 'no-store' })
            .then((res) => res.json())
            .then((d) => {
                if (d && Object.keys(d).length > 0) setData(d);
                else return fetch('/about/about.json').then(r => r.json()).then(setData);
            })
            .catch(() => {
                fetch('/about/about.json').then(r => r.json()).then(setData).catch(() => setData(null));
            });
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
            {/* Hero with Image */}
            <section className="relative min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.hero.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.hero.image} alt="" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${data.hero.overlayOpacity})` }} />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{data.hero.title}</h1>
                    <p className="text-lg md:text-xl text-white/70">{data.hero.subtitle}</p>
                </div>
            </section>

            {/* Intro with Side Image */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className={`grid grid-cols-1 ${data.intro.image ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
                        <div>
                            {data.intro.title && (
                                <h2 className="text-3xl md:text-4xl font-bold mb-8">{data.intro.title}</h2>
                            )}
                            <div className="space-y-5">
                                {data.intro.paragraphs.map((para, i) => (
                                    <p key={i} className="text-base md:text-lg text-neutral-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderBold(para) }} />
                                ))}
                            </div>
                            {data.intro.buttonText && (
                                <div className="mt-8">
                                    <Link href={data.intro.buttonLink || '#'} className="inline-block bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors">
                                        {data.intro.buttonText}
                                    </Link>
                                </div>
                            )}
                        </div>
                        {data.intro.image && (
                            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={data.intro.image} alt={data.intro.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats */}
            {data.stats && data.stats.length > 0 && (
                <section className="py-16 bg-black text-white">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {data.stats.map((stat) => (
                                <div key={stat.id}>
                                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-xs uppercase tracking-[2px] text-neutral-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Content Sections with Alternating Images */}
            {data.sections.sort((a, b) => a.order - b.order).map((section, idx) => (
                <section key={section.id} className={`py-20 md:py-24 ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className={`grid grid-cols-1 ${section.image ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
                            {/* Image Left */}
                            {section.image && section.imagePosition === 'left' && (
                                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden order-1 lg:order-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Text */}
                            <div className={section.image && section.imagePosition === 'left' ? 'order-2' : 'order-1'}>
                                {section.title && <h2 className="text-2xl md:text-3xl font-bold mb-6">{section.title}</h2>}
                                <p className="text-base md:text-lg text-neutral-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: renderBold(section.content) }} />
                                {section.list && section.list.length > 0 && (
                                    <ul className="space-y-3 mt-4">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black mt-0.5 flex-shrink-0">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
                                                </svg>
                                                <span className="text-neutral-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Image Right */}
                            {section.image && section.imagePosition === 'right' && (
                                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden order-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            ))}

            {/* Mission */}
            {data.mission && (
                <section className="relative py-24 md:py-32 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-900">
                        {data.mission.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={data.mission.image} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.mission.title}</h2>
                        <p className="text-lg text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderBold(data.mission.content) }} />
                    </div>
                </section>
            )}

            {/* Values */}
            {data.values.length > 0 && (
                <section className="py-20 md:py-28 bg-neutral-50">
                    <div className="max-w-5xl mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Bizim Değerlerimiz</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.values.map((value) => (
                                <div key={value.id} className="text-center p-8 bg-white border border-neutral-200">
                                    <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-5">
                                        {iconMap[value.icon] || iconMap.check}
                                    </div>
                                    <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
