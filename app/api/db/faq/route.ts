import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const items = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await prisma.fAQ.create({
            data: {
                question: body.question || '',
                answer: body.answer || '',
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
        const item = await prisma.fAQ.update({
            where: { id: body.id },
            data: {
                question: body.question,
                answer: body.answer,
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
        await prisma.fAQ.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
