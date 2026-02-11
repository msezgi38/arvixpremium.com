'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Section {
    id: number;
    title: string;
    content: string;
    list: string[];
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

const defaultData: AboutData = {
    hero: { title: '', subtitle: '', image: '', overlayOpacity: 0.6 },
    intro: { title: '', paragraphs: [''], image: '', buttonText: '', buttonLink: '' },
    sections: [],
    mission: { title: '', content: '', image: '' },
    values: [],
    stats: [],
};

const ICON_OPTIONS = [
    { value: 'target', label: '🎯 Hedef' },
    { value: 'award', label: '🏆 Ödül' },
    { value: 'check', label: '✅ Onay' },
    { value: 'heart', label: '❤️ Kalp' },
    { value: 'star', label: '⭐ Yıldız' },
    { value: 'shield', label: '🛡️ Güvenlik' },
    { value: 'users', label: '👥 Kullanıcılar' },
    { value: 'zap', label: '⚡ Enerji' },
];

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function HakkimizdaAdmin() {
    const [data, setData] = useState<AboutData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=about', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) {
                    setData({ ...defaultData, ...d });
                } else {
                    fetch('/about/about.json', { cache: 'no-store' })
                        .then(r => r.json())
                        .then(old => {
                            const merged = { ...defaultData, ...old };
                            setData(merged);
                            fetch('/api/db/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'about', value: merged }),
                            });
                        })
                        .catch(() => setData(defaultData));
                }
            })
            .catch(() => setData(null));
    }, []);

    const save = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'about', value: data }),
        });
        if (res.ok) { setMsg('✓ Kaydedildi!'); setTimeout(() => setMsg(''), 2000); }
        else setMsg('Hata oluştu');
    };

    if (!data) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

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

    // --- Sections helpers ---
    const addSection = () => {
        const newId = Math.max(0, ...(data.sections || []).map(s => s.id)) + 1;
        update('sections', [...(data.sections || []), { id: newId, title: '', content: '', list: [], image: '', imagePosition: 'right', order: (data.sections || []).length + 1 }]);
    };
    const removeSection = (id: number) => {
        update('sections', (data.sections || []).filter(s => s.id !== id));
    };
    const updateSection = (id: number, field: string, value: unknown) => {
        update('sections', (data.sections || []).map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // --- Stats helpers ---
    const addStat = () => {
        const newId = Math.max(0, ...(data.stats || []).map(s => s.id)) + 1;
        update('stats', [...(data.stats || []), { id: newId, value: '', label: '' }]);
    };
    const removeStat = (id: number) => {
        update('stats', (data.stats || []).filter(s => s.id !== id));
    };
    const updateStat = (id: number, field: string, value: string) => {
        update('stats', (data.stats || []).map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    // --- Values helpers ---
    const addValue = () => {
        const newId = Math.max(0, ...(data.values || []).map(v => v.id)) + 1;
        update('values', [...(data.values || []), { id: newId, title: '', description: '', icon: 'check' }]);
    };
    const removeValue = (id: number) => {
        update('values', (data.values || []).filter(v => v.id !== id));
    };
    const updateValue = (id: number, field: string, value: string) => {
        update('values', (data.values || []).map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Hakkımızda Sayfası</h1>
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
                    <ImageUpload value={data.hero?.image || ''} onChange={url => update('hero.image', url)} folder="about" label="Hero Görseli" />
                    <div><label className={labelClass}>Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero?.overlayOpacity ?? 0.6} onChange={e => update('hero.overlayOpacity', parseFloat(e.target.value))} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                </div>

                {/* ═══════════ GİRİŞ ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📝 Giriş Bölümü</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.intro?.title || ''} onChange={e => update('intro.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Paragraflar (her satır ayrı paragraf)</label><textarea value={(data.intro?.paragraphs || []).join('\n')} onChange={e => update('intro.paragraphs', e.target.value.split('\n'))} rows={5} className={inputClass} /></div>
                    <ImageUpload value={data.intro?.image || ''} onChange={url => update('intro.image', url)} folder="about" label="Giriş Görseli" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Yazısı</label><input value={data.intro?.buttonText || ''} onChange={e => update('intro.buttonText', e.target.value)} className={inputClass} placeholder="Ör: Hemen İletişime Geçin" /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.intro?.buttonLink || ''} onChange={e => update('intro.buttonLink', e.target.value)} className={inputClass} placeholder="Ör: /iletisim" /></div>
                    </div>
                </div>

                {/* ═══════════ İSTATİSTİKLER ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">📊 İstatistikler</h2>
                        <button onClick={addStat} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Ekle</button>
                    </div>
                    {(data.stats || []).map((stat) => (
                        <div key={stat.id} className="flex items-end gap-3 border-b border-neutral-100 pb-3">
                            <div className="flex-1"><label className={labelClass}>Değer</label><input value={stat.value || ''} onChange={e => updateStat(stat.id, 'value', e.target.value)} className={inputClass} placeholder="500+" /></div>
                            <div className="flex-1"><label className={labelClass}>Etiket</label><input value={stat.label || ''} onChange={e => updateStat(stat.id, 'label', e.target.value)} className={inputClass} placeholder="Tamamlanan Proje" /></div>
                            <button onClick={() => removeStat(stat.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-2 mb-0.5">Sil</button>
                        </div>
                    ))}
                    {(data.stats || []).length === 0 && <p className="text-sm text-neutral-400">Henüz istatistik eklenmedi.</p>}
                </div>

                {/* ═══════════ İÇERİK BÖLÜMLERİ ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">📄 İçerik Bölümleri</h2>
                        <button onClick={addSection} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Bölüm Ekle</button>
                    </div>
                    {(data.sections || []).sort((a, b) => a.order - b.order).map((section) => (
                        <div key={section.id} className="border border-neutral-200 rounded-lg p-4 space-y-3 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-600">Bölüm #{section.order}</span>
                                <button onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>
                            <div><label className={labelClass}>Başlık</label><input value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>İçerik (<code>**kalın**</code> destekli)</label><textarea value={section.content} onChange={e => updateSection(section.id, 'content', e.target.value)} rows={3} className={inputClass} /></div>
                            <div><label className={labelClass}>Liste Öğeleri (her satır bir öğe, boş bırakılabilir)</label><textarea value={(section.list || []).join('\n')} onChange={e => updateSection(section.id, 'list', e.target.value ? e.target.value.split('\n') : [])} rows={3} className={inputClass} placeholder="Madde 1&#10;Madde 2&#10;Madde 3" /></div>
                            <ImageUpload value={section.image} onChange={url => updateSection(section.id, 'image', url)} folder="about" label="Bölüm Görseli" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Görsel Pozisyonu</label>
                                    <select value={section.imagePosition} onChange={e => updateSection(section.id, 'imagePosition', e.target.value)} className={inputClass}>
                                        <option value="right">Sağda</option>
                                        <option value="left">Solda</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Sıra</label>
                                    <input type="number" min="1" value={section.order} onChange={e => updateSection(section.id, 'order', parseInt(e.target.value) || 1)} className={inputClass} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {(data.sections || []).length === 0 && <p className="text-sm text-neutral-400">Henüz içerik bölümü eklenmedi.</p>}
                </div>

                {/* ═══════════ MİSYON ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🎯 Misyon / Amaç Bölümü</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.mission?.title || ''} onChange={e => update('mission.title', e.target.value)} className={inputClass} placeholder="Amacımız" /></div>
                    <div><label className={labelClass}>İçerik (<code>**kalın**</code> destekli)</label><textarea value={data.mission?.content || ''} onChange={e => update('mission.content', e.target.value)} rows={4} className={inputClass} /></div>
                    <ImageUpload value={data.mission?.image || ''} onChange={url => update('mission.image', url)} folder="about" label="Misyon Arka Plan Görseli" />
                </div>

                {/* ═══════════ DEĞERLERİMİZ ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">⭐ Değerlerimiz</h2>
                        <button onClick={addValue} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Ekle</button>
                    </div>
                    {(data.values || []).map((val) => (
                        <div key={val.id} className="border border-neutral-200 rounded-lg p-4 space-y-3 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-600">Değer #{val.id}</span>
                                <button onClick={() => removeValue(val.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div><label className={labelClass}>Başlık</label><input value={val.title} onChange={e => updateValue(val.id, 'title', e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Açıklama</label><input value={val.description} onChange={e => updateValue(val.id, 'description', e.target.value)} className={inputClass} /></div>
                                <div>
                                    <label className={labelClass}>İkon</label>
                                    <select value={val.icon} onChange={e => updateValue(val.id, 'icon', e.target.value)} className={inputClass}>
                                        {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(data.values || []).length === 0 && <p className="text-sm text-neutral-400">Henüz değer eklenmedi.</p>}
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
