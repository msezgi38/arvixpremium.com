'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
    slides: number;
    categories: number;
    products: number;
    faq: number;
    blog: number;
    testimonials: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ slides: 0, categories: 0, products: 0, faq: 0, blog: 0, testimonials: 0 });

    useEffect(() => {
        Promise.all([
            fetch('/api/db/slides', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            fetch('/api/db/categories', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            fetch('/api/db/products', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            fetch('/api/db/faq', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            fetch('/api/db/blog', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
            fetch('/api/db/testimonials', { cache: 'no-store' }).then(r => r.json()).catch(() => []),
        ]).then(([slides, cats, products, faq, blog, testimonials]) => {
            setStats({
                slides: Array.isArray(slides) ? slides.length : 0,
                categories: Array.isArray(cats) ? cats.length : 0,
                products: Array.isArray(products) ? products.length : 0,
                faq: Array.isArray(faq) ? faq.length : 0,
                blog: Array.isArray(blog) ? blog.length : 0,
                testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
            });
        });
    }, []);

    const cards = [
        { label: 'Slider', count: stats.slides, href: '/admin/slider', icon: '🖼️' },
        { label: 'Kategoriler', count: stats.categories, href: '/admin/kategoriler', icon: '📂' },
        { label: 'Ürünler', count: stats.products, href: '/admin/urunler', icon: '📦' },
        { label: 'SSS', count: stats.faq, href: '/admin/sss', icon: '❓' },
        { label: 'Blog', count: stats.blog, href: '/admin/blog', icon: '📝' },
        { label: 'Testimonials', count: stats.testimonials, href: '/admin/testimonials', icon: '⭐' },
    ];

    const quickLinks = [
        { label: 'Header', href: '/admin/header' },
        { label: 'Footer', href: '/admin/footer' },
        { label: 'Slider Yönet', href: '/admin/slider' },
        { label: 'Kategoriler', href: '/admin/kategoriler' },
        { label: 'Kategori Ağacı', href: '/admin/kategori-yonetimi' },
        { label: 'Ürünler', href: '/admin/urunler' },
        { label: 'Hakkımızda', href: '/admin/hakkimizda' },
        { label: 'Marka & Logo', href: '/admin/marka-logo' },
        { label: 'Blog', href: '/admin/blog' },
        { label: 'SSS', href: '/admin/sss' },
        { label: 'İletişim', href: '/admin/iletisim' },
        { label: 'Testimonials', href: '/admin/testimonials' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-neutral-500 mt-1">Arvix Premium yönetim paneli</p>
                <p className="text-xs text-green-600 mt-1">● Tüm veriler veritabanından yükleniyor</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {cards.map((card) => (
                    <Link key={card.href} href={card.href} className="bg-white border border-neutral-200 p-6 hover:border-black hover:shadow-md transition-all rounded-lg group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{card.count}</p>
                                <p className="text-xs uppercase tracking-wider mt-1 text-neutral-400 group-hover:text-black transition-colors">{card.label}</p>
                            </div>
                            <span className="text-2xl opacity-30 group-hover:opacity-70 transition-opacity">{card.icon}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-10">
                <h2 className="text-lg font-bold mb-4">Hızlı Erişim</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="bg-white border border-neutral-200 p-4 hover:border-black transition-colors flex items-center justify-between group rounded-lg">
                            <span className="text-sm font-semibold">{link.label}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300 group-hover:text-black transition-colors"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
