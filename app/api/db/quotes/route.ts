import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const items = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await prisma.quoteRequest.update({
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
