import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Next.js App Router: increase body size limit for large image uploads (BMP can be 20MB+)
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Write to uploads/ directory (not public/) so files persist after rebuild
        const dir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const ext = path.extname(file.name).toLowerCase();
        const safeName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(new RegExp(ext.replace('.', '\\.') + '$', 'i'), '');
        const timestamp = Date.now();

        // Check if it's an image that should be converted to WebP
        const imageExts = ['.bmp', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.avif'];
        const isConvertible = imageExts.includes(ext);

        let filename: string;

        if (isConvertible) {
            // Convert to WebP using sharp
            filename = `${safeName}_${timestamp}.webp`;
            const filePath = path.join(dir, filename);

            const image = sharp(buffer);
            const metadata = await image.metadata();

            // Resize if wider than MAX_WIDTH, keep aspect ratio
            if (metadata.width && metadata.width > MAX_WIDTH) {
                image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
            }

            await image
                .webp({ quality: WEBP_QUALITY })
                .toFile(filePath);
        } else if (ext === '.webp') {
            // Already WebP — just optimize
            filename = `${safeName}_${timestamp}.webp`;
            const filePath = path.join(dir, filename);

            await sharp(buffer)
                .webp({ quality: WEBP_QUALITY })
                .toFile(filePath);
        } else {
            // Non-image file (svg, pdf, etc.) — save as-is
            filename = `${safeName}_${timestamp}${ext || '.bin'}`;
            const filePath = path.join(dir, filename);
            fs.writeFileSync(filePath, buffer);
        }

        // Return URL via the dynamic file serving API route
        return NextResponse.json({
            url: `/api/files/${folder}/${filename}`,
            filename,
        });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Yükleme hatası' }, { status: 500 });
    }
}
