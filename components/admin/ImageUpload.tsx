'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
}

// Convert any image (BMP, PNG, JPG, etc.) to WebP in browser before uploading
function convertToWebP(file: File, quality = 0.82, maxWidth = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
        // If already webp and small, skip conversion
        if (file.type === 'image/webp' && file.size < 500_000) {
            resolve(file);
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let w = img.width;
            let h = img.height;

            // Resize if too wide
            if (w > maxWidth) {
                h = Math.round((h * maxWidth) / w);
                w = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas not supported')); return; }

            ctx.drawImage(img, 0, 0, w, h);

            canvas.toBlob(
                (blob) => {
                    if (!blob) { reject(new Error('Conversion failed')); return; }
                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
                    resolve(webpFile);
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            // If conversion fails, use original
            resolve(file);
        };

        img.src = url;
    });
}

export default function ImageUpload({ value, onChange, folder = 'uploads', label = 'Görsel' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // Convert to WebP in browser first (handles BMP, PNG, JPG, etc.)
            const webpFile = await convertToWebP(file);

            const formData = new FormData();
            formData.append('file', webpFile);
            formData.append('folder', folder);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) onChange(data.url);
            else if (data.error) console.error('Upload error:', data.error);
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
            // Reset input so the same file can be re-selected
            if (fileRef.current) fileRef.current.value = '';
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
                    <input ref={fileRef} type="file" accept="image/*,.bmp" onChange={handleUpload} className="hidden" />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="mt-2 text-xs bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Dönüştürülüyor & Yükleniyor...' : 'Yükle'}
                    </button>
                </div>
            </div>
        </div>
    );
}
