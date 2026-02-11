import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SLIDES_FILE = path.join(process.cwd(), 'public', 'slides', 'slides.json');

function getSlides() {
    try {
        const data = fs.readFileSync(SLIDES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveSlides(slides: unknown[]) {
    fs.writeFileSync(SLIDES_FILE, JSON.stringify(slides, null, 2));
}

// GET - tüm slide'ları getir
export async function GET() {
    const slides = getSlides();
    return NextResponse.json(slides, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    });
}

// POST - yeni slide ekle
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const slides = getSlides();

        const newSlide = {
            id: Date.now(),
            title: body.title || '',
            subtitle: body.subtitle || '',
            image: body.image || '',
            active: body.active !== undefined ? body.active : true,
        };

        slides.push(newSlide);
        saveSlides(slides);

        return NextResponse.json(newSlide, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Slide eklenemedi' }, { status: 500 });
    }
}

// PUT - slide güncelle
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const slides = getSlides();

        const index = slides.findIndex((s: { id: number }) => s.id === body.id);
        if (index === -1) {
            return NextResponse.json({ error: 'Slide bulunamadı' }, { status: 404 });
        }

        slides[index] = { ...slides[index], ...body };
        saveSlides(slides);

        return NextResponse.json(slides[index]);
    } catch {
        return NextResponse.json({ error: 'Slide güncellenemedi' }, { status: 500 });
    }
}

// DELETE - slide sil
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));

        const slides = getSlides();
        const filtered = slides.filter((s: { id: number }) => s.id !== id);

        if (filtered.length === slides.length) {
            return NextResponse.json({ error: 'Slide bulunamadı' }, { status: 404 });
        }

        saveSlides(filtered);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Slide silinemedi' }, { status: 500 });
    }
}
