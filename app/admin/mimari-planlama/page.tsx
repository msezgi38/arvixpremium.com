'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

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
    hero: { title: 'Mimari Yerleşim Planı Desteği', subtitle: '', image: '', overlayOpacity: 0.6 },
    content: {
        title: 'Profesyonel Yerleşim Planlaması', description: '',
        features: [
            { title: 'Alan Verimliliği', description: '' },
            { title: 'Doğru Dolaşım', description: '' },
            { title: 'Maksimum Kapasite', description: '' },
            { title: 'Alanların Optimizasyonu', description: '' },
        ],
        image: '',
    },
    process: {
        title: 'Nasıl Çalışır?', subtitle: '',
        steps: [
            { title: 'Mimari Planı Gönderin', description: '' },
            { title: 'Uzman İncelemesi', description: '' },
            { title: 'Yerleşim Planı Teslimi', description: '' },
        ],
    },
    cta: { title: '', subtitle: '', buttonText: 'İletişime Geçin', buttonLink: '/iletisim', image: '' },
};

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function MimariPlanlamaAdmin() {
    const [data, setData] = useState<MimariData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=mimari-planlama', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
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

    const save = async () => {
        const res = await fetch('/api/db/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'mimari-planlama', value: data }),
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Mimari Planlama Sayfası</h1>
                    <p className="text-xs text-green-600 mt-1">● Veritabanı bağlantılı</p>
                </div>
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>
            {msg && <div className="fixed top-6 right-6 z-50 bg-black text-white px-5 py-3 text-sm font-medium shadow-lg rounded" style={{ animation: 'slideIn .3s ease-out' }}>{msg}</div>}

            <div className="space-y-6">

                {/* HERO */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🖼️ Hero Bölümü</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.hero.title} onChange={e => update('hero.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero.overlayOpacity} onChange={e => update('hero.overlayOpacity', parseFloat(e.target.value))} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                    </div>
                    <div><label className={labelClass}>Alt Başlık</label><textarea value={data.hero.subtitle} onChange={e => update('hero.subtitle', e.target.value)} rows={2} className={inputClass} /></div>
                    <ImageUpload value={data.hero.image} onChange={url => update('hero.image', url)} folder="mimari" label="Hero Görseli" />
                </div>

                {/* CONTENT */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📋 İçerik Bölümü</h2>
                    <div><label className={labelClass}>Başlık</label><input value={data.content.title} onChange={e => update('content.title', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Açıklama</label><textarea value={data.content.description} onChange={e => update('content.description', e.target.value)} rows={4} className={inputClass} /></div>
                    <ImageUpload value={data.content.image} onChange={url => update('content.image', url)} folder="mimari" label="İçerik Görseli" />

                    <h3 className="font-semibold text-sm border-t pt-4">Özellikler</h3>
                    {data.content.features.map((f, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-neutral-50 p-3 rounded">
                            <div><label className={labelClass}>Başlık</label><input value={f.title} onChange={e => { const features = [...data.content.features]; features[i] = { ...features[i], title: e.target.value }; update('content.features', features); }} className={inputClass} /></div>
                            <div className="md:col-span-2"><label className={labelClass}>Açıklama</label><input value={f.description} onChange={e => { const features = [...data.content.features]; features[i] = { ...features[i], description: e.target.value }; update('content.features', features); }} className={inputClass} /></div>
                        </div>
                    ))}
                    <button onClick={() => update('content.features', [...data.content.features, { title: '', description: '' }])} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Özellik Ekle</button>
                </div>

                {/* PROCESS */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🔄 Süreç Adımları</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.process.title} onChange={e => update('process.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.process.subtitle} onChange={e => update('process.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    {data.process.steps.map((s, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-neutral-50 p-3 rounded">
                            <div><label className={labelClass}>Adım {i + 1} Başlık</label><input value={s.title} onChange={e => { const steps = [...data.process.steps]; steps[i] = { ...steps[i], title: e.target.value }; update('process.steps', steps); }} className={inputClass} /></div>
                            <div className="md:col-span-2"><label className={labelClass}>Açıklama</label><input value={s.description} onChange={e => { const steps = [...data.process.steps]; steps[i] = { ...steps[i], description: e.target.value }; update('process.steps', steps); }} className={inputClass} /></div>
                        </div>
                    ))}
                    <button onClick={() => update('process.steps', [...data.process.steps, { title: '', description: '' }])} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Adım Ekle</button>
                </div>

                {/* CTA */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📢 CTA (Alt Bölüm)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.cta.title} onChange={e => update('cta.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.cta.subtitle} onChange={e => update('cta.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Buton Metni</label><input value={data.cta.buttonText} onChange={e => update('cta.buttonText', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Buton Linki</label><input value={data.cta.buttonLink} onChange={e => update('cta.buttonLink', e.target.value)} className={inputClass} /></div>
                    </div>
                    <ImageUpload value={data.cta.image} onChange={url => update('cta.image', url)} folder="mimari" label="CTA Görseli" />
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
