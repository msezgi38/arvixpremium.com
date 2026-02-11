import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FILE = path.join(process.cwd(), 'public', 'faq', 'faq.json');
const DIR = path.join(process.cwd(), 'public', 'faq');

function getData() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch { return []; }
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = getData();
        body.id = data.length > 0 ? Math.max(...data.map((f: { id: number }) => f.id)) + 1 : 1;
        data.push(body);
        saveData(data);
        return NextResponse.json(body, { status: 201 });
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const data = getData();
        const idx = data.findIndex((f: { id: number }) => f.id === body.id);
        if (idx === -1) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
        data[idx] = body;
        saveData(data);
        return NextResponse.json(body);
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        let data = getData();
        data = data.filter((f: { id: number }) => f.id !== id);
        saveData(data);
        return NextResponse.json({ success: true });
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}
