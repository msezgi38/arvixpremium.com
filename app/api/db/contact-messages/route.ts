import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const items = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await prisma.contactMessage.create({
            data: {
                name: body.name || '',
                email: body.email || '',
                phone: body.phone || null,
                company: body.company || null,
                subject: body.subject || null,
                message: body.message || '',
                fields: body.fields ? JSON.stringify(body.fields) : null,
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
        const item = await prisma.contactMessage.update({
            where: { id: body.id },
            data: {
                status: body.status,
                note: body.note,
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
        await prisma.contactMessage.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
