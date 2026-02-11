'use client';

import { useState, useEffect } from 'react';

interface WhyUsItem {
    title: string;
    description: string;
}

interface HomeData {
    about: { title: string; paragraphs: string[]; buttonText: string; buttonLink: string };
    branding: { title: string; subtitle: string; buttonText: string; buttonLink: string };
    whyUs: { title: string; items: WhyUsItem[] };
    cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
}

const defaultData: HomeData = {
    about: {
        title: 'ARVIX Nedir?',
        paragraphs: [
            'Arvix ekibi olarak; profesyonel spor salonları, butik stüdyolar ve kurumsal fitness yatırımları için yüksek standartlarda fitness ekipmanlarını tedarik eden, markalayan ve uçtan uca yöneten bir çözüm ortağıyız.',
            'Yurt dışındaki üretici fabrikalarla doğrudan iş birliği içinde çalışarak; aracı marka ve distribütör zincirlerini ortadan kaldırır, fitness ekipmanlarını kendi marka ve logonuzla pazara sunmanıza imkân tanırız.',
        ],
        buttonText: 'Daha Fazla Bilgi',
        buttonLink: '/hakkimizda',
    },
    branding: {
        title: 'Kendi Marka ve Logonuzu Oluşturun',
        subtitle: 'Tüm ekipmanları kendi markanız ve renk paletinizle özelleştirin.',
        buttonText: 'Daha Fazla Bilgi',
        buttonLink: '/marka-logo',
    },
    whyUs: {
        title: 'Neden Arvix?',
        items: [
            { title: 'Direkt Fabrika', description: '%20-40 daha avantajlı fabrika çıkış fiyatları' },
            { title: 'Profesyonel Kalite', description: 'Ticari kullanım için uzun ömürlü ekipmanlar' },
            { title: 'Özelleştirme', description: 'Logo, renk ve tasarımda tam kontrol' },
        ],
    },
    cta: {
        title: 'Profesyonel Spor Salonu Kurmaya Hazır Mısınız?',
        subtitle: 'Proje danışmanlığından ekipman tedariğine uçtan uca çözümler',
        buttonText: 'Teklif Al',
        buttonLink: '/iletisim',
    },
};

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function AnasayfaAdmin() {
    const [data, setData] = useState<HomeData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=homepage', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) {
                    setData({
                        about: { ...defaultData.about, ...d.about },
                        branding: { ...defaultData.branding, ...d.branding },
                        whyUs: { ...defaultData.whyUs, ...d.whyUs },
                        cta: { ...defaultData.cta, ...d.cta },
                    });
                } else {
                    setData(defaultData);
                }
            })
            .catch(() => setData(defaultData));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'homepage', value: data }),
        });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
        else setMsg('Hata oluştu');
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    // Generic nested updater
    const update = (path: string, value: unknown) => {
        const keys = path.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newData: any = JSON.parse(JSON.stringify(data));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (obj[keys[i]] === undefined) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        setData(newData);
    };

    // Paragraph helpers
    const addParagraph = () => {
        const paragraphs = [...data.about.paragraphs, ''];
        update('about.paragraphs', paragraphs);
    };
    const removeParagraph = (index: number) => {
        const paragraphs = [...data.about.paragraphs];
        paragraphs.splice(index, 1);
        update('about.paragraphs', paragraphs);
    };
    const updateParagraph = (index: number, value: string) => {
        const paragraphs = [...data.about.paragraphs];
        paragraphs[index] = value;
        update('about.paragraphs', paragraphs);
    };

    // WhyUs item helpers
    const addWhyItem = () => {
        const items = [...data.whyUs.items, { title: '', description: '' }];
        update('whyUs.items', items);
    };
    const removeWhyItem = (index: number) => {
        const items = [...data.whyUs.items];
        items.splice(index, 1);
        update('whyUs.items', items);
    };
    const updateWhyItem = (index: number, field: string, value: string) => {
        const items = [...data.whyUs.items];
        items[index] = { ...items[index], [field]: value };
        update('whyUs.items', items);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Ana Sayfa Yönetimi</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Slider, Kategoriler, Blog ve Testimonials ayrı admin sayfalarından düzenlenir</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">

                {/* ═══════════ HAKKIMIZDA BÖLÜMÜ ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">📖 Hakkımızda Bölümü</h2>
                        <button onClick={addParagraph} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Paragraf Ekle</button>
                    </div>
                    <div><label className={labelClass}>Başlık</label><input value={data.about.title} onChange={e => update('about.title', e.target.value)} className={inputClass} /></div>
                    {data.about.paragraphs.map((p, i) => (
                        <div key={i} className="relative">
                            <label className={labelClass}>Paragraf #{i + 1}</label>
                            <div className="flex gap-2">
                                <textarea value={p} onChange={e => updateParagraph(i, e.target.value)} rows={3} className={`${inputClass} flex-1`} />
                                <button onClick={() => removeParagraph(i)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0 self-start mt-1">Sil</button>
                            </div>
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.about.buttonText} onChange={e => update('about.buttonText', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.about.buttonLink} onChange={e => update('about.buttonLink', e.target.value)} className={inputClass} /></div>
                    </div>
                </div>

                {/* ═══════════ MARKA & LOGO CTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🏷️ Marka & Logo Bölümü</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.branding.title} onChange={e => update('branding.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.branding.subtitle} onChange={e => update('branding.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.branding.buttonText} onChange={e => update('branding.buttonText', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.branding.buttonLink} onChange={e => update('branding.buttonLink', e.target.value)} className={inputClass} /></div>
                    </div>
                </div>

                {/* ═══════════ NEDEN ARVIX ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">⭐ Neden Arvix?</h2>
                        <button onClick={addWhyItem} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Madde Ekle</button>
                    </div>
                    <div><label className={labelClass}>Bölüm Başlığı</label><input value={data.whyUs.title} onChange={e => update('whyUs.title', e.target.value)} className={inputClass} /></div>
                    {data.whyUs.items.map((item, i) => (
                        <div key={i} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-600">Madde #{i + 1}</span>
                                <button onClick={() => removeWhyItem(i)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div><label className={labelClass}>Başlık</label><input value={item.title} onChange={e => updateWhyItem(i, 'title', e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Açıklama</label><input value={item.description} onChange={e => updateWhyItem(i, 'description', e.target.value)} className={inputClass} /></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══════════ FINAL CTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📢 Alt CTA Bölümü</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.cta.title} onChange={e => update('cta.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.cta.subtitle} onChange={e => update('cta.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.cta.buttonText} onChange={e => update('cta.buttonText', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.cta.buttonLink} onChange={e => update('cta.buttonLink', e.target.value)} className={inputClass} /></div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">💡 Diğer Bölümler</p>
                    <ul className="space-y-1 text-xs text-blue-600">
                        <li>• <strong>Slider:</strong> Admin → Slider sayfasından düzenlenir</li>
                        <li>• <strong>Kategori Görselleri:</strong> Admin → Kategoriler sayfasından düzenlenir</li>
                        <li>• <strong>Blog:</strong> Admin → Blog sayfasından düzenlenir</li>
                        <li>• <strong>Testimonials:</strong> Admin → Testimonials sayfasından düzenlenir</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
