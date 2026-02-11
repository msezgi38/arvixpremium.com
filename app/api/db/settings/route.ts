import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/db/settings?key=header
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        if (!key) {
            const all = await prisma.siteSettings.findMany();
            const result: Record<string, unknown> = {};
            for (const s of all) {
                try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
            }
            return NextResponse.json(result);
        }
        const setting = await prisma.siteSettings.findUnique({ where: { key } });
        if (!setting) return NextResponse.json({});
        try {
            return NextResponse.json(JSON.parse(setting.value));
        } catch {
            return NextResponse.json({ value: setting.value });
        }
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// PUT /api/db/settings  { key: "header", value: { ... } }
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value } = body;
        if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        const setting = await prisma.siteSettings.upsert({
            where: { key },
            update: { value: valueStr },
            create: { key, value: valueStr },
        });
        return NextResponse.json(setting);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
