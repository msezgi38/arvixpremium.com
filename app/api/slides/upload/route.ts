import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SLIDES_DIR = path.join(process.cwd(), 'public', 'slides');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        // Ensure directory exists
        if (!fs.existsSync(SLIDES_DIR)) {
            fs.mkdirSync(SLIDES_DIR, { recursive: true });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `slide_${Date.now()}${path.extname(file.name)}`;
        const filepath = path.join(SLIDES_DIR, filename);

        fs.writeFileSync(filepath, buffer);

        return NextResponse.json({
            url: `/slides/${filename}`,
            filename
        });
    } catch {
        return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 });
    }
}
