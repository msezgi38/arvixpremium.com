'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

interface FormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder: string;
    fullWidth: boolean;
    options?: string[];
}

interface ContactData {
    hero: { title: string; subtitle: string; image: string; overlayOpacity: number };
    info: {
        title: string;
        subtitle: string;
        email: string;
        phone: string;
        whatsapp: string;
        address: string;
        mapEmbed: string;
        workingHours: { weekdays: string; saturday: string; sunday: string };
        social: { instagram: string; facebook: string; linkedin: string; youtube: string };
    };
    form: {
        title: string;
        subtitle: string;
        fields: FormField[];
        submitText: string;
        successMessage: string;
    };
    cta: { title: string; subtitle: string; image: string };
}

const defaultData: ContactData = {
    hero: { title: 'İletişim', subtitle: '', image: '', overlayOpacity: 0.6 },
    info: {
        title: 'İletişim Bilgileri', subtitle: '',
        email: '', phone: '', whatsapp: '', address: '', mapEmbed: '',
        workingHours: { weekdays: '', saturday: '', sunday: '' },
        social: { instagram: '', facebook: '', linkedin: '', youtube: '' },
    },
    form: {
        title: 'Teklif Alın', subtitle: '', fields: [], submitText: 'Gönder', successMessage: 'Mesajınız gönderildi!',
    },
    cta: { title: '', subtitle: '', image: '' },
};

const inputClass = 'w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1';
const cardClass = 'bg-white border border-neutral-200 p-6 space-y-4 rounded-lg';

export default function IletisimAdmin() {
    const [data, setData] = useState<ContactData | null>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/db/settings?key=contact', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => {
                if (d && Object.keys(d).length > 0) {
                    // Deep merge with defaults to ensure all nested fields exist
                    const merged: ContactData = {
                        hero: { ...defaultData.hero, ...d.hero },
                        info: {
                            ...defaultData.info, ...d.info,
                            workingHours: { ...defaultData.info.workingHours, ...(d.info?.workingHours || {}) },
                            social: { ...defaultData.info.social, ...(d.info?.social || {}) },
                        },
                        form: { ...defaultData.form, ...d.form, fields: d.form?.fields || defaultData.form.fields },
                        cta: { ...defaultData.cta, ...d.cta },
                    };
                    setData(merged);
                } else {
                    fetch('/contact/contact.json', { cache: 'no-store' })
                        .then(r => r.json())
                        .then(old => {
                            setData({ ...defaultData, ...old, info: { ...defaultData.info, ...old.info, workingHours: { ...defaultData.info.workingHours, ...(old.info?.workingHours || {}) }, social: { ...defaultData.info.social, ...(old.info?.social || {}) } }, form: { ...defaultData.form, ...old.form, fields: old.form?.fields || [] }, cta: { ...defaultData.cta, ...old.cta } });
                            fetch('/api/db/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'contact', value: old }) });
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
            body: JSON.stringify({ key: 'contact', value: data }),
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

    // Form field helpers
    const addField = () => {
        const fields = [...(data.form.fields || []), { name: `field_${Date.now()}`, label: '', type: 'text', required: false, placeholder: '', fullWidth: false }];
        update('form.fields', fields);
    };
    const removeField = (index: number) => {
        const fields = [...data.form.fields];
        fields.splice(index, 1);
        update('form.fields', fields);
    };
    const updateField = (index: number, key: string, value: unknown) => {
        const fields = [...data.form.fields];
        fields[index] = { ...fields[index], [key]: value };
        update('form.fields', fields);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">İletişim Sayfası</h1>
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
                        <div><label className={labelClass}>Başlık</label><input value={data.hero.title} onChange={e => update('hero.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.hero.subtitle} onChange={e => update('hero.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <ImageUpload value={data.hero.image} onChange={url => update('hero.image', url)} folder="contact" label="Hero Görseli" />
                    <div><label className={labelClass}>Overlay Opaklığı (0-1)</label><input type="number" step="0.1" min="0" max="1" value={data.hero.overlayOpacity} onChange={e => update('hero.overlayOpacity', parseFloat(e.target.value))} className="w-32 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black rounded" /></div>
                </div>

                {/* ═══════════ İLETİŞİM BİLGİLERİ ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📞 İletişim Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Bölüm Başlığı</label><input value={data.info.title} onChange={e => update('info.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.info.subtitle} onChange={e => update('info.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>E-posta</label><input value={data.info.email} onChange={e => update('info.email', e.target.value)} className={inputClass} placeholder="info@example.com" /></div>
                        <div><label className={labelClass}>Telefon</label><input value={data.info.phone} onChange={e => update('info.phone', e.target.value)} className={inputClass} placeholder="+90 XXX XXX XX XX" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>WhatsApp Numarası</label><input value={data.info.whatsapp} onChange={e => update('info.whatsapp', e.target.value)} className={inputClass} placeholder="+90XXXXXXXXXX" /></div>
                        <div><label className={labelClass}>Adres</label><input value={data.info.address} onChange={e => update('info.address', e.target.value)} className={inputClass} placeholder="İstanbul, Türkiye" /></div>
                    </div>
                </div>

                {/* ═══════════ ÇALIŞMA SAATLERİ ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🕐 Çalışma Saatleri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={labelClass}>Hafta İçi</label><input value={data.info.workingHours.weekdays} onChange={e => update('info.workingHours.weekdays', e.target.value)} className={inputClass} placeholder="Pazartesi - Cuma: 09:00 - 18:00" /></div>
                        <div><label className={labelClass}>Cumartesi</label><input value={data.info.workingHours.saturday} onChange={e => update('info.workingHours.saturday', e.target.value)} className={inputClass} placeholder="Cumartesi: 10:00 - 16:00" /></div>
                        <div><label className={labelClass}>Pazar</label><input value={data.info.workingHours.sunday} onChange={e => update('info.workingHours.sunday', e.target.value)} className={inputClass} placeholder="Pazar: Kapalı" /></div>
                    </div>
                </div>

                {/* ═══════════ SOSYAL MEDYA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🌐 Sosyal Medya</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Instagram URL</label><input value={data.info.social.instagram} onChange={e => update('info.social.instagram', e.target.value)} className={inputClass} placeholder="https://instagram.com/..." /></div>
                        <div><label className={labelClass}>Facebook URL</label><input value={data.info.social.facebook} onChange={e => update('info.social.facebook', e.target.value)} className={inputClass} placeholder="https://facebook.com/..." /></div>
                        <div><label className={labelClass}>LinkedIn URL</label><input value={data.info.social.linkedin} onChange={e => update('info.social.linkedin', e.target.value)} className={inputClass} placeholder="https://linkedin.com/..." /></div>
                        <div><label className={labelClass}>YouTube URL</label><input value={data.info.social.youtube} onChange={e => update('info.social.youtube', e.target.value)} className={inputClass} placeholder="https://youtube.com/..." /></div>
                    </div>
                </div>

                {/* ═══════════ HARİTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">🗺️ Google Maps</h2>
                    <div>
                        <label className={labelClass}>Google Maps Embed HTML</label>
                        <textarea value={data.info.mapEmbed} onChange={e => update('info.mapEmbed', e.target.value)} rows={3} className={`${inputClass} font-mono text-xs`} placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>' />
                        <p className="text-xs text-neutral-400 mt-1">Google Maps → Paylaş → Haritayı yerleştir → HTML kodunu yapıştırın</p>
                    </div>
                    {data.info.mapEmbed && (
                        <div className="aspect-video bg-neutral-100 overflow-hidden rounded border border-neutral-200" dangerouslySetInnerHTML={{ __html: data.info.mapEmbed }} />
                    )}
                </div>

                {/* ═══════════ FORM ═══════════ */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-lg">📝 İletişim Formu</h2>
                        <button onClick={addField} className="text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold">+ Alan Ekle</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Form Başlığı</label><input value={data.form.title} onChange={e => update('form.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Form Alt Başlığı</label><input value={data.form.subtitle} onChange={e => update('form.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Gönder Butonu Yazısı</label><input value={data.form.submitText} onChange={e => update('form.submitText', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Başarı Mesajı</label><input value={data.form.successMessage} onChange={e => update('form.successMessage', e.target.value)} className={inputClass} /></div>
                    </div>

                    {/* Form Fields */}
                    {data.form.fields.map((field, index) => (
                        <div key={index} className="border border-neutral-200 rounded-lg p-4 space-y-3 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-neutral-600">Alan #{index + 1}</span>
                                <button onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Sil</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div><label className={labelClass}>Alan Adı (name)</label><input value={field.name} onChange={e => updateField(index, 'name', e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Etiket (Label)</label><input value={field.label} onChange={e => updateField(index, 'label', e.target.value)} className={inputClass} /></div>
                                <div>
                                    <label className={labelClass}>Tip</label>
                                    <select value={field.type} onChange={e => updateField(index, 'type', e.target.value)} className={inputClass}>
                                        <option value="text">Text</option>
                                        <option value="email">Email</option>
                                        <option value="tel">Telefon</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="select">Select</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Placeholder</label><input value={field.placeholder} onChange={e => updateField(index, 'placeholder', e.target.value)} className={inputClass} /></div>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={field.required} onChange={e => updateField(index, 'required', e.target.checked)} className="w-4 h-4" /> Zorunlu</label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={field.fullWidth} onChange={e => updateField(index, 'fullWidth', e.target.checked)} className="w-4 h-4" /> Tam Genişlik</label>
                            </div>
                            {field.type === 'select' && (
                                <div>
                                    <label className={labelClass}>Seçenekler (her satır bir seçenek)</label>
                                    <textarea value={(field.options || []).join('\n')} onChange={e => updateField(index, 'options', e.target.value.split('\n'))} rows={3} className={inputClass} placeholder={"Teklif Talebi\nÜrün Bilgisi\nDiğer"} />
                                </div>
                            )}
                        </div>
                    ))}
                    {data.form.fields.length === 0 && <p className="text-sm text-neutral-400">Henüz form alanı eklenmedi.</p>}
                </div>

                {/* ═══════════ CTA ═══════════ */}
                <div className={cardClass}>
                    <h2 className="font-bold text-lg border-b pb-2">📢 CTA (Alt Bölüm)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Başlık</label><input value={data.cta.title} onChange={e => update('cta.title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Alt Başlık</label><input value={data.cta.subtitle} onChange={e => update('cta.subtitle', e.target.value)} className={inputClass} /></div>
                    </div>
                    <ImageUpload value={data.cta.image} onChange={url => update('cta.image', url)} folder="contact" label="CTA Görseli" />
                </div>

            </div>

            <div className="mt-8 flex justify-end">
                <button onClick={save} className="bg-black text-white text-xs uppercase tracking-wider px-8 py-3 hover:bg-neutral-800 rounded">Kaydet</button>
            </div>

            <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}
