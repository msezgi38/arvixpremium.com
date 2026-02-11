import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const filePath = path.join(process.cwd(), 'public', 'header.json');

export async function GET() {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
    } catch {
        return NextResponse.json({}, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 });
    }
}
