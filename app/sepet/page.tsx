'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function SepetPage() {
    const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();
    const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const submitQuote = async () => {
        if (!form.name || !form.email || !form.phone) {
            setError('Lütfen zorunlu alanları doldurun.');
            return;
        }
        setSending(true);
        setError('');
        try {
            const res = await fetch('/api/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    items: items.map(i => ({
                        id: i.id,
                        name: i.name,
                        category: i.category,
                        categoryName: i.categoryName,
                        quantity: i.quantity,
                    })),
                }),
            });
            if (res.ok) {
                setStep('success');
                clearCart();
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        }
        setSending(false);
    };

    // Success
    if (step === 'success') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h1 className="text-3xl font-bold">Teklif Talebiniz Alındı!</h1>
                <p className="text-neutral-500 text-sm text-center max-w-md">Ekibimiz en kısa sürede sizinle iletişime geçecektir. Teşekkür ederiz.</p>
                <Link href="/" className="bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-3 hover:bg-neutral-800 transition-colors mt-4">
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    // Empty cart
    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-300">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <h1 className="text-2xl font-bold">Sepetiniz Boş</h1>
                <p className="text-neutral-500 text-sm">Teklif almak istediğiniz ürünleri sepete ekleyin.</p>
                <Link href="/" className="bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-8 py-3 hover:bg-neutral-800 transition-colors">
                    Ürünlere Dön
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <section className="bg-neutral-50 border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{step === 'form' ? 'Teklif Formu' : 'Teklif Sepeti'}</h1>
                        <p className="text-sm text-neutral-500 mt-1">{totalItems} ürün seçildi</p>
                    </div>
                    {step === 'form' && (
                        <button onClick={() => setStep('cart')} className="text-xs uppercase tracking-wider text-neutral-500 hover:text-black transition-colors flex items-center gap-1">
                            ← Sepete Dön
                        </button>
                    )}
                </div>
            </section>

            {step === 'cart' ? (
                /* ====== CART VIEW ====== */
                <section className="py-12 bg-white">
                    <div className="max-w-5xl mx-auto px-6">
                        {/* Cart Table */}
                        <div className="hidden sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left text-[10px] uppercase tracking-[2px] text-neutral-400 py-3 font-semibold">Ürün</th>
                                        <th className="text-left text-[10px] uppercase tracking-[2px] text-neutral-400 py-3 font-semibold">Kategori</th>
                                        <th className="text-center text-[10px] uppercase tracking-[2px] text-neutral-400 py-3 font-semibold">Adet</th>
                                        <th className="text-right text-[10px] uppercase tracking-[2px] text-neutral-400 py-3 font-semibold w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={`${item.category}-${item.id}`} className="border-b border-neutral-100 hover:bg-neutral-50">
                                            <td className="py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
                                                        {item.image ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link href={`/urunler/${item.category}/${item.id.toLowerCase()}`} className="font-bold text-sm uppercase tracking-wider hover:underline">
                                                        {item.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="py-4 text-xs text-neutral-500">{item.categoryName}</td>
                                            <td className="py-4">
                                                <div className="flex items-center justify-center gap-0">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors">−</button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="w-12 h-8 border-t border-b border-neutral-300 text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-black hover:text-black transition-colors">+</button>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button onClick={() => removeItem(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                            {items.map(item => (
                                <div key={`${item.category}-${item.id}`} className="flex gap-4 p-4 border border-neutral-200">
                                    <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm uppercase tracking-wider">{item.name}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">{item.categoryName}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-0">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-sm">−</button>
                                                <span className="w-10 h-8 border-t border-b border-neutral-300 flex items-center justify-center text-sm font-semibold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-sm">+</button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-neutral-300 hover:text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                            <button onClick={clearCart} className="text-xs uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors">
                                Sepeti Temizle
                            </button>
                            <button
                                onClick={() => setStep('form')}
                                className="bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-10 py-4 hover:bg-neutral-800 transition-colors flex items-center gap-2"
                            >
                                Teklif İste
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                /* ====== FORM VIEW ====== */
                <section className="py-12 bg-white">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                            {/* Form */}
                            <div className="lg:col-span-3">
                                <h2 className="text-lg font-bold mb-6">İletişim Bilgileriniz</h2>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">{error}</div>
                                )}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-1.5">Ad Soyad *</label>
                                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Adınız Soyadınız" className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-1.5">Firma</label>
                                            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Firma Adı (opsiyonel)" className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-1.5">E-posta *</label>
                                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-1.5">Telefon *</label>
                                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+90 5XX XXX XX XX" className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[2px] font-semibold text-neutral-500 mb-1.5">Mesajınız</label>
                                        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Ek bilgi veya özel isteklerinizi yazabilirsiniz..." className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none" />
                                    </div>
                                </div>

                                <button
                                    onClick={submitQuote}
                                    disabled={sending}
                                    className="mt-6 w-full sm:w-auto bg-black text-white text-xs uppercase tracking-[2px] font-semibold px-12 py-4 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                            Teklif Talebini Gönder
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-2">
                                <div className="bg-neutral-50 border border-neutral-200 p-6 sticky top-24">
                                    <h3 className="text-xs uppercase tracking-[2px] font-bold mb-4">Sipariş Özeti</h3>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {items.map(item => (
                                            <div key={`${item.category}-${item.id}`} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-neutral-200 flex-shrink-0 overflow-hidden">
                                                    {item.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">?</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-wider truncate">{item.name}</p>
                                                    <p className="text-[10px] text-neutral-400">{item.categoryName}</p>
                                                </div>
                                                <span className="text-xs font-bold flex-shrink-0">{item.quantity}x</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-neutral-300 mt-4 pt-4 flex items-center justify-between">
                                        <span className="text-xs uppercase tracking-wider text-neutral-500">Toplam Ürün</span>
                                        <span className="text-lg font-bold">{totalItems}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
