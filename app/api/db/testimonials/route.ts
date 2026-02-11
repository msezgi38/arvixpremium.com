import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await prisma.testimonial.create({
            data: {
                name: body.name || '',
                company: body.company || null,
                text: body.text || '',
                image: body.image || null,
                rating: body.rating ?? 5,
                active: body.active ?? true,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(item);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await prisma.testimonial.update({
            where: { id: body.id },
            data: {
                name: body.name,
                company: body.company,
                text: body.text,
                image: body.image,
                rating: body.rating,
                active: body.active,
                order: body.order,
            },
        });
        return NextResponse.json(item);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await prisma.testimonial.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
