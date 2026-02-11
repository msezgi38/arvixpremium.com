import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - list products
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');

    try {
        // Single product by slug
        if (slug) {
            const product = await prisma.product.findUnique({
                where: { slug },
                include: {
                    images: { orderBy: { order: 'asc' } },
                    videos: { orderBy: { order: 'asc' } },
                    category: { include: { parent: true } },
                },
            });
            if (!product) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
            return NextResponse.json(product, {
                headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
            });
        }

        // Products by category
        const where: Record<string, unknown> = {};
        if (categoryId) where.categoryId = categoryId;
        if (categorySlug) {
            const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
            if (cat) where.categoryId = cat.id;
        }
        if (featured === 'true') where.featured = true;

        const products = await prisma.product.findMany({
            where,
            orderBy: { order: 'asc' },
            include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
                category: true,
            },
        });

        return NextResponse.json(products, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
    } catch (e) {
        return NextResponse.json({ error: 'Hata', detail: String(e) }, { status: 500 });
    }
}

// POST - create product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const product = await prisma.product.create({
            data: {
                name: body.name,
                slug: body.slug,
                oldName: body.oldName || null,
                newName: body.newName || body.name,
                description: body.description || null,
                specifications: body.specifications || null,
                categoryId: body.categoryId,
                featured: body.featured ?? false,
                active: body.active ?? true,
                order: body.order ?? 0,
            },
        });

        // Create images if provided
        if (body.images && Array.isArray(body.images)) {
            for (let i = 0; i < body.images.length; i++) {
                await prisma.productImage.create({
                    data: {
                        productId: product.id,
                        url: body.images[i].url || body.images[i],
                        alt: body.images[i].alt || body.name,
                        order: i,
                    },
                });
            }
        }

        // Single image shorthand
        if (body.image && !body.images) {
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    url: body.image,
                    alt: body.name,
                    order: 0,
                },
            });
        }

        const full = await prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true },
        });
        return NextResponse.json(full, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Oluşturulamadı', detail: String(e) }, { status: 500 });
    }
}

// PUT - update product
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

        const product = await prisma.product.update({
            where: { id: body.id },
            data: {
                name: body.name,
                slug: body.slug,
                oldName: body.oldName,
                newName: body.newName,
                description: body.description,
                specifications: body.specifications,
                categoryId: body.categoryId,
                featured: body.featured,
                active: body.active,
                order: body.order,
            },
        });

        // Update images if provided
        if (body.images && Array.isArray(body.images)) {
            await prisma.productImage.deleteMany({ where: { productId: product.id } });
            for (let i = 0; i < body.images.length; i++) {
                await prisma.productImage.create({
                    data: {
                        productId: product.id,
                        url: body.images[i].url || body.images[i],
                        alt: body.images[i].alt || body.name,
                        order: i,
                    },
                });
            }
        }

        // Single image shorthand (same as POST)
        if (body.image && !body.images) {
            // Delete existing images and create new one
            await prisma.productImage.deleteMany({ where: { productId: product.id } });
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    url: body.image,
                    alt: body.name,
                    order: 0,
                },
            });
        }

        const full = await prisma.product.findUnique({
            where: { id: product.id },
            include: { images: true, category: true },
        });
        return NextResponse.json(full);
    } catch (e) {
        return NextResponse.json({ error: 'Güncellenemedi', detail: String(e) }, { status: 500 });
    }
}

// DELETE - delete product
export async function DELETE(request: NextRequest) {
    try {
        const id = new URL(request.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Silinemedi', detail: String(e) }, { status: 500 });
    }
}
