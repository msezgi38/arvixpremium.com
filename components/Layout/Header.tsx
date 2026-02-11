'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';

const categories = [
  { name: 'Plaka Yüklemeli', slug: 'plaka-yuklemeli' },
  { name: 'Pinli Aletler', slug: 'pinli-aletler' },
  { name: 'Kardiyo', slug: 'kardiyo' },
  { name: 'İstasyonlar', slug: 'istasyonlar' },
  { name: 'Sehpa & Bench', slug: 'sehpa-bench' },
  { name: 'Aksesuarlar', slug: 'aksesuarlar' },
];

interface NavLink { name: string; href: string; active: boolean; }
interface SubItem { id: string; name: string; active: boolean; }
interface CatCache { [slug: string]: SubItem[]; }

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subItems, setSubItems] = useState<CatCache>({});
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { totalItems } = useCart();
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { name: 'Biz Kimiz', href: '/hakkimizda', active: true },
    { name: 'Marka & Logo', href: '/marka-logo', active: true },
    { name: 'Blog', href: '/blog', active: true },
    { name: 'SSS', href: '/sss', active: true },
    { name: 'İletişim', href: '/iletisim', active: true },
  ]);
  const [ctaText, setCtaText] = useState('Teklif Al');
  const [ctaLink, setCtaLink] = useState('/iletisim');

  useEffect(() => {
    fetch('/header.json')
      .then(r => r.json())
      .then(data => {
        if (data.navLinks) setNavLinks(data.navLinks);
        if (data.ctaText) setCtaText(data.ctaText);
        if (data.ctaLink) setCtaLink(data.ctaLink);
      })
      .catch(() => { });
  }, []);

  const fetchCategory = useCallback(async (slug: string) => {
    if (subItems[slug]) return;
    try {
      const res = await fetch(`/products/${slug}.json`);
      const data = await res.json();
      const items: SubItem[] = (
        data.products || data.subcategories || data.series || data.categories || []
      ).filter((item: SubItem) => item.active);
      setSubItems(prev => ({ ...prev, [slug]: items }));
    } catch {
      setSubItems(prev => ({ ...prev, [slug]: [] }));
    }
  }, [subItems]);

  useEffect(() => {
    categories.forEach(cat => fetchCategory(cat.slug));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeNavLinks = navLinks.filter(l => l.active);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arvixlogo.png" alt="Arvix Premium" className="h-8 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {activeNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[12px] font-medium uppercase tracking-[2px] text-neutral-300 hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/sepet" className="relative text-neutral-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{totalItems}</span>
              )}
            </Link>
            <Link href={ctaLink} className="hidden lg:inline-block bg-white text-black text-[12px] font-bold uppercase tracking-[2px] px-6 py-2.5 hover:bg-neutral-200 transition-colors">
              {ctaText}
            </Link>
            <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Bar - Desktop */}
      <div className="hidden lg:block bg-neutral-900 border-t border-neutral-800 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center">
            {categories.map((cat, i) => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setActiveCategory(cat.slug)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  href={`/urunler/${cat.slug}`}
                  className={`relative flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[1.5px] px-5 py-3.5 transition-colors ${activeCategory === cat.slug ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  {i > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3.5 bg-neutral-700" />}
                  {cat.name}
                  {subItems[cat.slug] && subItems[cat.slug].length > 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50"><path d="m6 9 6 6 6-6" /></svg>
                  )}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-white transition-all duration-300 ${activeCategory === cat.slug ? 'w-4/5' : 'w-0'
                    }`} />
                </Link>

                {/* Dropdown */}
                {activeCategory === cat.slug && subItems[cat.slug] && subItems[cat.slug].length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-0">
                    <div className="bg-black border border-neutral-800 shadow-2xl shadow-black/50 min-w-[220px] py-2">
                      <div className="px-5 py-2 border-b border-neutral-800 mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-neutral-500">{cat.name}</p>
                      </div>
                      {subItems[cat.slug].map((item) => (
                        <Link
                          key={item.id}
                          href={`/urunler/${cat.slug}/${item.id.toLowerCase()}`}
                          className="flex items-center gap-3 px-5 py-2.5 text-[12px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors group"
                        >
                          <span className="w-1 h-1 rounded-full bg-neutral-600 group-hover:bg-white transition-colors" />
                          {item.name}
                        </Link>
                      ))}
                      <div className="border-t border-neutral-800 mt-1 pt-1">
                        <Link href={`/urunler/${cat.slug}`} className="block px-5 py-2 text-[11px] font-medium uppercase tracking-[1.5px] text-neutral-500 hover:text-white transition-colors">
                          Tümünü Gör →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black border-t border-neutral-800 max-h-[85vh] overflow-y-auto">
          <div className="px-6 pt-5 pb-3 space-y-1">
            {activeNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-[13px] font-medium uppercase tracking-[2px] py-2.5 text-neutral-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-neutral-800">
            <div className="px-6 pt-4 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-neutral-600">Ürün Kategorileri</p>
            </div>
            {categories.map((cat) => (
              <div key={cat.slug} className="border-b border-neutral-800/50">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}
                  className={`w-full flex items-center justify-between px-6 py-3.5 text-[13px] font-medium uppercase tracking-[1.5px] transition-colors ${mobileExpanded === cat.slug ? 'bg-neutral-900 text-white' : 'text-neutral-400 active:bg-neutral-900'
                    }`}
                >
                  {cat.name}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${mobileExpanded === cat.slug ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {mobileExpanded === cat.slug && subItems[cat.slug] && (
                  <div className="bg-neutral-900/60 pb-2">
                    {subItems[cat.slug].map((item) => (
                      <Link key={item.id} href={`/urunler/${cat.slug}/${item.id.toLowerCase()}`} className="flex items-center gap-2.5 px-8 py-2.5 text-[12px] font-medium text-neutral-500 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <span className="w-1 h-1 rounded-full bg-neutral-700" />
                        {item.name}
                      </Link>
                    ))}
                    <Link href={`/urunler/${cat.slug}`} className="block px-8 py-2 text-[11px] font-medium uppercase tracking-wider text-neutral-600 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Tümünü Gör →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-5">
            <Link href={ctaLink} className="block text-center bg-white text-black text-[13px] font-bold uppercase tracking-[2px] px-6 py-3.5 hover:bg-neutral-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              {ctaText}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
