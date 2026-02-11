import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

        const dir = path.join(process.cwd(), 'public', folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const ext = path.extname(file.name) || '.jpg';
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(ext, '');
        const filename = `${safeName}_${Date.now()}${ext}`;
        const filePath = path.join(dir, filename);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            url: `/${folder}/${filename}`,
            filename,
        });
    } catch {
        return NextResponse.json({ error: 'Yükleme hatası' }, { status: 500 });
    }
}
