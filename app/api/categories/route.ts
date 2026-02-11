import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CATEGORIES_FILE = path.join(process.cwd(), 'public', 'categories', 'categories.json');
const CATEGORIES_DIR = path.join(process.cwd(), 'public', 'categories');

function getCategories() {
    try {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveCategories(categories: unknown[]) {
    if (!fs.existsSync(CATEGORIES_DIR)) {
        fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// GET
export async function GET() {
    return NextResponse.json(getCategories());
}

// POST - yeni kategori ekle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const categories = getCategories();

        const newCat = {
            id: Date.now(),
            name: body.name || '',
            image: body.image || '',
            slug: body.slug || '',
            active: body.active !== undefined ? body.active : true,
        };

        categories.push(newCat);
        saveCategories(categories);
        return NextResponse.json(newCat, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Kategori eklenemedi' }, { status: 500 });
    }
}

// PUT - kategori güncelle
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const categories = getCategories();
        const index = categories.findIndex((c: { id: number }) => c.id === body.id);
        if (index === -1) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

        categories[index] = { ...categories[index], ...body };
        saveCategories(categories);
        return NextResponse.json(categories[index]);
    } catch {
        return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        const categories = getCategories();
        const filtered = categories.filter((c: { id: number }) => c.id !== id);
        if (filtered.length === categories.length) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
        saveCategories(filtered);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
    }
}
