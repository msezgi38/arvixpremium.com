'use client';

import { useState, useEffect } from 'react';

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

export default function ContactPage() {
    const [data, setData] = useState<ContactData | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [sent, setSent] = useState(false);

    useEffect(() => {
        fetch('/contact/contact.json')
            .then((res) => res.json())
            .then(setData)
            .catch(() => setData(null));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        setFormValues({});
        setTimeout(() => setSent(false), 4000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const hasSocial = data.info.social && Object.values(data.info.social).some(Boolean);

    return (
        <>
            {/* Hero with Image */}
            <section className="relative min-h-[400px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-neutral-900">
                    {data.hero.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.hero.image} alt="" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${data.hero.overlayOpacity})` }} />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{data.hero.title}</h1>
                    <p className="text-lg md:text-xl text-white/70">{data.hero.subtitle}</p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Dynamic Form */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">{data.form.title}</h2>
                            <p className="text-neutral-500 mb-8">{data.form.subtitle}</p>

                            {sent && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm">
                                    ✓ {data.form.successMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {data.form.fields.map((field) => {
                                        const wrapper = (
                                            <div key={field.name} className={field.fullWidth ? 'col-span-1 md:col-span-2' : ''}>
                                                <label htmlFor={field.name} className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                                                    {field.label} {field.required && '*'}
                                                </label>
                                                {field.type === 'textarea' ? (
                                                    <textarea
                                                        id={field.name} name={field.name} required={field.required} rows={5}
                                                        value={formValues[field.name] || ''} onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-black focus:outline-none transition-colors text-sm resize-none"
                                                        placeholder={field.placeholder}
                                                    />
                                                ) : field.type === 'select' ? (
                                                    <select
                                                        id={field.name} name={field.name} required={field.required}
                                                        value={formValues[field.name] || ''} onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-black focus:outline-none transition-colors text-sm"
                                                    >
                                                        <option value="">{field.placeholder}</option>
                                                        {field.options?.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type} id={field.name} name={field.name} required={field.required}
                                                        value={formValues[field.name] || ''} onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-black focus:outline-none transition-colors text-sm"
                                                        placeholder={field.placeholder}
                                                    />
                                                )}
                                            </div>
                                        );
                                        return wrapper;
                                    })}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-black text-white text-xs uppercase tracking-[2px] font-semibold py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                                    </svg>
                                    {data.form.submitText}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">{data.info.title}</h2>
                            <p className="text-neutral-500 mb-8">{data.info.subtitle}</p>

                            <div className="space-y-4">
                                {/* Email */}
                                <div className="flex items-start gap-4 p-5 border border-neutral-200 bg-neutral-50">
                                    <div className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">E-posta</h3>
                                        <a href={`mailto:${data.info.email}`} className="text-neutral-600 hover:text-black transition-colors text-sm">{data.info.email}</a>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4 p-5 border border-neutral-200 bg-neutral-50">
                                    <div className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Telefon</h3>
                                        <a href={`tel:${data.info.phone.replace(/\s/g, '')}`} className="text-neutral-600 hover:text-black transition-colors text-sm">{data.info.phone}</a>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                {data.info.whatsapp && (
                                    <div className="flex items-start gap-4 p-5 border border-neutral-200 bg-neutral-50">
                                        <div className="w-11 h-11 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">WhatsApp</h3>
                                            <a href={`https://wa.me/${data.info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-black transition-colors text-sm">Mesaj Gönder</a>
                                        </div>
                                    </div>
                                )}

                                {/* Address */}
                                <div className="flex items-start gap-4 p-5 border border-neutral-200 bg-neutral-50">
                                    <div className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Adres</h3>
                                        <p className="text-neutral-600 text-sm">{data.info.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="mt-6 p-5 bg-black text-white">
                                <h3 className="font-semibold mb-3">Çalışma Saatleri</h3>
                                <div className="space-y-1 text-sm text-neutral-300">
                                    <p>{data.info.workingHours.weekdays}</p>
                                    <p>{data.info.workingHours.saturday}</p>
                                    <p>{data.info.workingHours.sunday}</p>
                                </div>
                            </div>

                            {/* Social */}
                            {hasSocial && (
                                <div className="mt-6 flex gap-3">
                                    {data.info.social.instagram && (
                                        <a href={data.info.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                        </a>
                                    )}
                                    {data.info.social.facebook && (
                                        <a href={data.info.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                        </a>
                                    )}
                                    {data.info.social.linkedin && (
                                        <a href={data.info.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                        </a>
                                    )}
                                    {data.info.social.youtube && (
                                        <a href={data.info.social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Map */}
                            {data.info.mapEmbed && (
                                <div className="mt-6 aspect-video bg-neutral-100 overflow-hidden" dangerouslySetInnerHTML={{ __html: data.info.mapEmbed }} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-neutral-50">
                    {data.cta.image && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.cta.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50" />
                        </>
                    )}
                </div>
                <div className={`relative z-10 max-w-3xl mx-auto px-6 text-center ${data.cta.image ? 'text-white' : ''}`}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.cta.title}</h2>
                    <p className={data.cta.image ? 'text-white/70' : 'text-neutral-500'}>{data.cta.subtitle}</p>
                </div>
            </section>
        </>
    );
}
