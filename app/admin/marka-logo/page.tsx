'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

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
}

const defaultData: BrandData = {
    hero: { title: 'Kendi Marka ve Logonu Oluştur', subtitle: 'Seçtiğin spor aletlerini markana özel olarak yeniden tasarla', image: '', overlayOpacity: 0.6 },
    intro: { title: 'Markana Özel Ekipman Tasarımı', paragraphs: ['ARVIX, seçtiğin spor aletlerini markana özel olarak yeniden tasarlamanı sağlar. Her detay; estetik, kalite ve prestij anlayışın doğrultusunda şekillenir.'] },
    sections: [
        { id: 1, title: 'Metal Gövde Rengini Siz Belirleyin', description: 'Ekipmanlarımızın metal gövdesi, salonunuzun karakterini yansıtacak şekilde size özel olarak renklendirilir.\nMat, parlak veya özel kaplama seçenekleriyle; güçlü, rafine ve prestijli bir görünüm sunan metal renkleri arasından özgürce seçim yapabilirsiniz.', image: '', images: [] },
        { id: 2, title: 'Koltuk Renginizi Seçmenize İmkan Sağlıyoruz', description: 'Oturma ve temas yüzeylerinde kullanılan döşeme renkleri, mekân estetiğinizle kusursuz bir uyum sağlayacak biçimde belirlenir.\nZarafet, konfor ve kaliteyi bir araya getiren özel renk alternatifleriyle ekipmanlarınıza sofistike bir kimlik kazandırabilirsiniz.', image: '', images: [] },
        { id: 3, title: 'Logo ve Markanız Artık Spor Ekipmanınızda', description: 'Ekipmanlarınız, marka kimliğinizi yansıtacak şekilde logonuz ve isimlendirme tercihinizle özel olarak hazırlanır.\nPVC, metal, üç boyutlu kabartma veya yüksek kaliteli sticker uygulamalarıyla; logonuz ekipmanların tasarımına entegre edilerek prestijli ve kurumsal bir görünüm elde edilir.', image: '', images: [] },
    ],
    gallery: [],
    cta: { title: 'Markanızı Ekipmanlarınıza Taşıyın', subtitle: 'Profesyonel ekibimizle iletişime geçin', buttonText: 'Teklif Al', buttonLink: '/iletisim' },
};

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function MarkaLogoAdmin() {
    const [data, setData] = useState<BrandData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=brand', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) {
                    // Migrate old format
                    const migrated: BrandData = {
                        hero: d.hero || defaultData.hero,
                        intro: d.intro || (d.content ? { title: d.content.title, paragraphs: d.content.paragraphs } : defaultData.intro),
                        sections: d.sections || (d.features ? d.features.map((f: { id: number; title: string; description: string; image: string }) => ({ ...f, images: f.image ? [f.image] : [] })) : defaultData.sections),
                        gallery: d.gallery || defaultData.gallery,
                        cta: d.cta || defaultData.cta,
                    };
                    setData(migrated);
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
            body: JSON.stringify({ key: 'brand', value: data }),
        });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
        else setMsg('Hata oluştu');
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

    const update = (path: string, value: unknown) => {
        setData(prev => {
            if (!prev) return prev;
            const keys = path.split('.');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newData: any = JSON.parse(JSON.stringify(prev));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let obj: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (obj[keys[i]] === undefined) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // Section helpers
    const addSection = () => {
        setData(prev => {
            if (!prev) return prev;
            const newId = Math.max(0, ...(prev.sections || []).map(s => s.id)) + 1;
            return { ...prev, sections: [...(prev.sections || []), { id: newId, title: '', description: '', image: '', images: [] }] };
        });
    };
    const removeSection = (id: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, sections: (prev.sections || []).filter(s => s.id !== id) };
        });
    };
    const updateSection = (id: number, field: string, value: unknown) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, sections: (prev.sections || []).map(s => s.id === id ? { ...s, [field]: value } : s) };
        });
    };
    const addSectionImage = (id: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, sections: (prev.sections || []).map(s => s.id === id ? { ...s, images: [...(s.images || []), ''] } : s) };
        });
    };
    const removeSectionImage = (sectionId: number, imgIdx: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, sections: (prev.sections || []).map(s => s.id === sectionId ? { ...s, images: (s.images || []).filter((_, i) => i !== imgIdx) } : s) };
        });
    };
    const updateSectionImage = (sectionId: number, imgIdx: number, url: string) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, sections: (prev.sections || []).map(s => s.id === sectionId ? { ...s, images: (s.images || []).map((img, i) => i === imgIdx ? url : img) } : s) };
        });
    };

    // Gallery helpers
    const addGalleryItem = () => {
        setData(prev => {
            if (!prev) return prev;
            const newId = Math.max(0, ...(prev.gallery || []).map(g => g.id)) + 1;
            return { ...prev, gallery: [...(prev.gallery || []), { id: newId, image: '', title: '' }] };
        });
    };
    const removeGalleryItem = (id: number) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, gallery: (prev.gallery || []).filter(g => g.id !== id) };
        });
    };
    const updateGalleryItem = (id: number, field: string, value: string) => {
        setData(prev => {
            if (!prev) return prev;
            return { ...prev, gallery: (prev.gallery || []).map(g => g.id === id ? { ...g, [field]: value } : g) };
        });
    };

    const sectionIcons = ['🎨', '🛋️', '🏷️', '⭐', '🔧', '💎'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Marka & Logo Sayfası</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">

                {/* ═══════════ HERO ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🖼️ Hero Bölümü</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.hero?.title || ''} onChange={e => update('hero.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.hero?.subtitle || ''} onChange={e => update('hero.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <ImageUpload value={data.hero?.image || ''} onChange={url => update('hero.image', url)} folder="brand" label="Hero Görseli" />
                    <div><label className={labelClass}>Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero?.overlayOpacity ?? 0.6} onChange={e => update('hero.overlayOpacity', parseFloat(e.target.value))} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                </div>

                {/* ═══════════ GİRİŞ ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📝 Giriş Bölümü</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.intro?.title || ''} onChange={e => update('intro.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Paragraflar (her satır ayrı paragraf)</label><textarea value={(data.intro?.paragraphs || []).join('\n')} onChange={e => update('intro.paragraphs', e.target.value.split('\n'))} rows={4} className={inputClass} /></div>
                </div>

                {/* ═══════════ ÖZELLEŞTİRME BÖLÜMLERİ ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">🔧 Özelleştirme Bölümleri</h2>
                        <button onClick={addSection} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Bölüm Ekle</button>
                    </div>
                    <p className="text-xs text-neutral-400">Her bölüm sayfada solda metin / sağda görsel olarak gösterilir. Sıralama değişimli olur (zigzag).</p>

                    {(data.sections || []).map((section, sIdx) => (
                        <div key={section.id} className="border border-neutral-200 rounded-lg p-5 space-y-4 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-700">{sectionIcons[sIdx] || '📌'} Bölüm #{sIdx + 1}</span>
                                <button onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>

                            <div><label className={labelClass}>Başlık</label><input value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Açıklama</label><textarea value={section.description} onChange={e => updateSection(section.id, 'description', e.target.value)} rows={4} className={inputClass} /></div>

                            {/* Main image */}
                            <ImageUpload value={section.image} onChange={url => updateSection(section.id, 'image', url)} folder="brand" label="Ana Görsel" />

                            {/* Additional images */}
                            <div className="border-t pt-4 mt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <label className={labelClass}>Ek Görseller (Galeri)</label>
                                    <button onClick={() => addSectionImage(section.id)} className="text-xs bg-neutral-200 hover:bg-neutral-300 px-3 py-1 rounded font-semibold">+ Görsel Ekle</button>
                                </div>
                                {(section.images || []).length === 0 && <p className="text-xs text-neutral-400">Ek görsel yok. Birden fazla görsel eklerseniz grid galeri olarak gösterilir.</p>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(section.images || []).map((img, imgIdx) => (
                                        <div key={imgIdx} className="relative">
                                            <ImageUpload value={img} onChange={url => updateSectionImage(section.id, imgIdx, url)} folder="brand" label={`Görsel ${imgIdx + 1}`} />
                                            <button onClick={() => removeSectionImage(section.id, imgIdx)} className="absolute top-0 right-0 text-red-400 hover:text-red-600 text-xs p-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {(data.sections || []).length === 0 && <p className="text-sm text-neutral-400">Henüz bölüm eklenmedi.</p>}
                </div>

                {/* ═══════════ ÜRÜN GALERİSİ ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">📸 Ürün Galerisi</h2>
                        <button onClick={addGalleryItem} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Ürün Ekle</button>
                    </div>
                    <p className="text-xs text-neutral-400">Sayfada koyu arka planda ürün resimleri grid olarak gösterilir.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(data.gallery || []).map((item) => (
                            <div key={item.id} className="border border-neutral-200 rounded-lg p-3 space-y-2 bg-white">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-500">#{item.id}</span>
                                    <button onClick={() => removeGalleryItem(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕ Sil</button>
                                </div>
                                <ImageUpload value={item.image} onChange={url => updateGalleryItem(item.id, 'image', url)} folder="brand" label="Ürün Görseli" />
                                <input value={item.title} onChange={e => updateGalleryItem(item.id, 'title', e.target.value)} className={inputClass} placeholder="Ürün adı (opsiyonel)" />
                            </div>
                        ))}
                    </div>
                    {(data.gallery || []).length === 0 && <p className="text-sm text-neutral-400">Henüz ürün görseli eklenmedi.</p>}
                </div>

                {/* ═══════════ CTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📢 CTA (Aksiyon Alanı)</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.cta?.title || ''} onChange={e => update('cta.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Alt Başlık</label><input value={data.cta?.subtitle || ''} onChange={e => update('cta.subtitle', e.target.value)} className={inputClass} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.cta?.buttonText || ''} onChange={e => update('cta.buttonText', e.target.value)} className={inputClass} placeholder="Teklif Al" /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.cta?.buttonLink || ''} onChange={e => update('cta.buttonLink', e.target.value)} className={inputClass} placeholder="/iletisim" /></div>
                    </div>
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
