'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { name: 'Header', href: '/admin/header', icon: 'M4 6h16M4 12h16M4 18h7' },
    { name: 'Footer', href: '/admin/footer', icon: 'M4 6h16M4 12h8m-8 6h16' },
    { name: 'Slider', href: '/admin/slider', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Kategoriler', href: '/admin/kategoriler', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Ürünler', href: '/admin/urunler', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Kategori Ağacı', href: '/admin/kategori-yonetimi', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6' },
    { name: 'Hakkımızda', href: '/admin/hakkimizda', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Marka & Logo', href: '/admin/marka-logo', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Blog', href: '/admin/blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { name: 'SSS', href: '/admin/sss', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'İletişim', href: '/admin/iletisim', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Testimonials', href: '/admin/testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authed, setAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        if (pathname === '/admin/login') {
            setAuthed(false);
            return;
        }
        fetch('/api/auth')
            .then(r => { if (r.ok) setAuthed(true); else { setAuthed(false); router.push('/admin/login'); } })
            .catch(() => { setAuthed(false); router.push('/admin/login'); });
    }, [pathname, router]);

    const logout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        router.push('/admin/login');
    };

    // Login page - no sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Loading state
    if (authed === null) {
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not authenticated
    if (!authed) return null;

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black text-white flex-shrink-0 fixed h-full overflow-y-auto z-40">
                <div className="p-6 border-b border-neutral-800">
                    <Link href="/admin" className="block">
                        <h1 className="text-lg font-bold tracking-[3px]">ARVIX</h1>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-[2px] mt-1">Admin Panel</p>
                    </Link>
                </div>
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs uppercase tracking-wider transition-colors ${isActive ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800 space-y-3">
                    <Link href="/" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                        Siteyi Görüntüle
                    </Link>
                    <button onClick={logout} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 min-w-0 overflow-x-hidden">
                <div className="max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
