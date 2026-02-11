'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
}

export default function ImageUpload({ value, onChange, folder = 'uploads', label = 'Görsel' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) onChange(data.url);
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">{label}</label>
            <div className="flex items-start gap-3">
                <div className="w-24 h-24 bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    )}
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="/path/to/image.jpg"
                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="mt-2 text-xs bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Yükleniyor...' : 'Yükle'}
                    </button>
                </div>
            </div>
        </div>
    );
}
