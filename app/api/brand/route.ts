import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BRAND_FILE = path.join(process.cwd(), 'public', 'brand', 'brand.json');
const BRAND_DIR = path.join(process.cwd(), 'public', 'brand');

function getData() {
    try { return JSON.parse(fs.readFileSync(BRAND_FILE, 'utf-8')); } catch { return {}; }
}

export async function GET() {
    return NextResponse.json(getData());
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        if (!fs.existsSync(BRAND_DIR)) fs.mkdirSync(BRAND_DIR, { recursive: true });
        fs.writeFileSync(BRAND_FILE, JSON.stringify(body, null, 2));
        return NextResponse.json(body);
    } catch {
        return NextResponse.json({ error: 'Hata' }, { status: 500 });
    }
}
