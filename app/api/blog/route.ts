import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FILE = path.join(process.cwd(), 'public', 'blog', 'blog.json');
const DIR = path.join(process.cwd(), 'public', 'blog');

function getData() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch { return []; }
}
function saveData(data: unknown[]) {
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
        const item = { id: Date.now(), title: body.title || '', excerpt: body.excerpt || '', image: body.image || '', date: body.date || new Date().toISOString().split('T')[0], slug: body.slug || '', active: true };
        data.push(item);
        saveData(data);
        return NextResponse.json(item, { status: 201 });
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const data = getData();
        const i = data.findIndex((x: { id: number }) => x.id === body.id);
        if (i === -1) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
        data[i] = { ...data[i], ...body };
        saveData(data);
        return NextResponse.json(data[i]);
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = Number(new URL(request.url).searchParams.get('id'));
        const data = getData();
        const filtered = data.filter((x: { id: number }) => x.id !== id);
        if (filtered.length === data.length) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
        saveData(filtered);
        return NextResponse.json({ success: true });
    } catch { return NextResponse.json({ error: 'Hata' }, { status: 500 }); }
}
