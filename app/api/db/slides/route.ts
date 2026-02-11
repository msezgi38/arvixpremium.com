import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const slides = await prisma.slide.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(slides);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const slide = await prisma.slide.create({
            data: {
                title: body.title || '',
                subtitle: body.subtitle || null,
                image: body.image || null,
                active: body.active ?? true,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(slide);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const slide = await prisma.slide.update({
            where: { id: body.id },
            data: {
                title: body.title,
                subtitle: body.subtitle,
                image: body.image,
                active: body.active,
                order: body.order,
            },
        });
        return NextResponse.json(slide);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await prisma.slide.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
