import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - full category tree with product counts
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const slug = searchParams.get('slug');
    const tree = searchParams.get('tree') === 'true';

    try {
        if (slug) {
            const category = await prisma.category.findUnique({
                where: { slug },
                include: {
                    children: {
                        where: { active: true },
                        orderBy: { order: 'asc' },
                        include: {
                            _count: { select: { products: true } },
                            children: {
                                where: { active: true },
                                orderBy: { order: 'asc' },
                                include: { _count: { select: { products: true } } },
                            },
                        },
                    },
                    _count: { select: { products: true } },
                },
            });
            if (!category) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
            return NextResponse.json(category, {
                headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
            });
        }

        if (tree) {
            // Full 3-level tree: main categories → subcategories → sub-subcategories
            const categories = await prisma.category.findMany({
                where: { parentId: null },
                orderBy: { order: 'asc' },
                include: {
                    children: {
                        orderBy: { order: 'asc' },
                        include: {
                            _count: { select: { products: true } },
                            children: {
                                orderBy: { order: 'asc' },
                                include: { _count: { select: { products: true } } },
                            },
                        },
                    },
                    _count: { select: { products: true } },
                },
            });
            return NextResponse.json(categories, {
                headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
            });
        }

        // Flat list by parentId
        const where = parentId === 'null' || parentId === null
            ? { parentId: null as string | null }
            : parentId ? { parentId } : {};

        const categories = await prisma.category.findMany({
            where,
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { products: true, children: true } },
            },
        });

        return NextResponse.json(categories, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
    } catch (e) {
        return NextResponse.json({ error: 'Hata', detail: String(e) }, { status: 500 });
    }
}

// POST - create category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const category = await prisma.category.create({
            data: {
                name: body.name,
                slug: body.slug,
                oldName: body.oldName || null,
                newName: body.newName || null,
                description: body.description || null,
                image: body.image || null,
                active: body.active ?? true,
                parentId: body.parentId || null,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(category, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Oluşturulamadı', detail: String(e) }, { status: 500 });
    }
}

// PUT - update category
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
        const category = await prisma.category.update({
            where: { id: body.id },
            data: {
                name: body.name,
                slug: body.slug,
                oldName: body.oldName,
                newName: body.newName,
                description: body.description,
                image: body.image,
                active: body.active,
                parentId: body.parentId,
                order: body.order,
            },
        });
        return NextResponse.json(category);
    } catch (e) {
        return NextResponse.json({ error: 'Güncellenemedi', detail: String(e) }, { status: 500 });
    }
}

// DELETE - delete category
export async function DELETE(request: NextRequest) {
    try {
        const id = new URL(request.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Silinemedi', detail: String(e) }, { status: 500 });
    }
}
