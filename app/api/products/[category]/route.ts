import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
    const file = path.join(PRODUCTS_DIR, `${category}.json`);
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
    } catch {
        return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    const { category } = await params;
    const file = path.join(PRODUCTS_DIR, `${category}.json`);
    try {
        const body = await request.json();
        if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
        fs.writeFileSync(file, JSON.stringify(body, null, 2));
        return NextResponse.json(body);
    } catch {
        return NextResponse.json({ error: 'Hata' }, { status: 500 });
    }
}
