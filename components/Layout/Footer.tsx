'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FooterData {
    company: { name: string; description: string };
    quickLinks: { name: string; href: string }[];
    contact: { email: string; phone: string; address: string };
    copyright: string;
    socialLinks: { name: string; url: string; active: boolean }[];
}

interface FooterCategory {
    name: string;
    slug: string;
    active: boolean;
}

const defaultData: FooterData = {
    company: { name: 'ARVIX', description: 'Profesyonel fitness ekipmanları tedarikçisi' },
    quickLinks: [
        { name: 'Hakkımızda', href: '/hakkimizda' },
        { name: 'Kendi Markanı Oluştur', href: '/marka-logo' },
        { name: 'SSS', href: '/sss' },
        { name: 'İletişim', href: '/iletisim' },
    ],
    contact: { email: 'info@arvixpremium.com', phone: '+90 XXX XXX XX XX', address: 'İstanbul, Türkiye' },
    copyright: 'Arvix Premium. Tüm hakları saklıdır.',
    socialLinks: [],
};

const socialIcons: Record<string, string> = {
    Instagram: 'M7.8 2h8.4C19 2 22 5 22 7.8v8.4A5.8 5.8 0 0116.2 22H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6',
    LinkedIn: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77',
    YouTube: 'M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73',
};

export default function Footer() {
    const [data, setData] = useState<FooterData>(defaultData);
    const [categories, setCategories] = useState<FooterCategory[]>([]);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        fetch('/api/db/settings?key=footer', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => setData({ ...defaultData, ...d }))
            .catch(() => { });

        // Fetch categories from database
        fetch('/api/db/categories?tree=true', { cache: 'no-store' })
            .then(r => r.json())
            .then((cats: FooterCategory[]) => {
                if (Array.isArray(cats)) {
                    setCategories(cats.filter(c => c.active));
                }
            })
            .catch(() => { });
    }, []);

    return (
        <footer className="bg-black text-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Company */}
                    <div>
                        <h3 className="text-xl font-bold tracking-[4px] mb-4">{data.company.name}</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">{data.company.description}</p>
                        {/* Social Links */}
                        {data.socialLinks.filter(s => s.active).length > 0 && (
                            <div className="flex gap-3 mt-5">
                                {data.socialLinks.filter(s => s.active).map(s => (
                                    <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={socialIcons[s.name] || ''} /></svg>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Hızlı Bağlantılar</h4>
                        <ul className="space-y-3">
                            {data.quickLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories - from database */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">Kategoriler</h4>
                        <ul className="space-y-3">
                            {categories.map(cat => (
                                <li key={cat.slug}>
                                    <Link href={`/urunler/${cat.slug}`} className="text-neutral-400 hover:text-white transition-colors text-sm">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[2px] mb-5">İletişim</h4>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                {data.contact.email}
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                {data.contact.phone}
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                {data.contact.address}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8 text-center">
                    <p className="text-xs text-neutral-500">&copy; {currentYear} {data.copyright}</p>
                </div>
            </div>
        </footer>
    );
}
