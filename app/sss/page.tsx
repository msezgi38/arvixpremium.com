'use client';

import { useState, useEffect } from 'react';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    active: boolean;
    order: number;
}

export default function SSSPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/db/faq', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: FaqItem[]) => {
                const active = (Array.isArray(data) ? data : []).filter((f) => f.active).sort((a, b) => a.order - b.order);
                setFaqs(active);
            })
            .catch(() => setFaqs([]));
    }, []);

    const renderAnswer = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, k) =>
            k % 2 === 1 ? <strong key={k}>{part}</strong> : part
        );
    };

    return (
        <>
            {/* Hero */}
            <section className="py-24 md:py-32 bg-black text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">SSS</h1>
                    <p className="text-lg md:text-xl text-white/70">Sıkça Sorulan Sorular</p>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    {faqs.length > 0 ? (
                        <div className="space-y-0">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="border-b border-neutral-200">
                                    <button
                                        onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                        className="w-full py-6 flex items-center justify-between text-left group"
                                    >
                                        <span className="text-base md:text-lg font-semibold pr-4 group-hover:text-neutral-600 transition-colors">
                                            {faq.question}
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            className={`flex-shrink-0 transition-transform duration-300 ${openId === faq.id ? 'rotate-45' : ''}`}
                                        >
                                            <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
                                        </svg>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-96 pb-6' : 'max-h-0'}`}
                                    >
                                        <div className="text-neutral-600 leading-relaxed text-sm md:text-base">
                                            {renderAnswer(faq.answer)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-neutral-500">
                            <p className="text-lg">Henüz soru eklenmemiş.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
