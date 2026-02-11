import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FILE = path.join(process.cwd(), 'public', 'about', 'about.json');
const DIR = path.join(process.cwd(), 'public', 'about');

function getData() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch { return {}; }
}
function saveData(data: unknown) {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
    return NextResponse.json(getData(), {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        saveData(body);
        return NextResponse.json(body);
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}
