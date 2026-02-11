import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const posts = await prisma.blogPost.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const post = await prisma.blogPost.create({
            data: {
                title: body.title || '',
                slug: body.slug || body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `post-${Date.now()}`,
                excerpt: body.excerpt || null,
                content: body.content || null,
                image: body.image || null,
                author: body.author || null,
                published: body.published ?? false,
                order: body.order ?? 0,
            },
        });
        return NextResponse.json(post);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const post = await prisma.blogPost.update({
            where: { id: body.id },
            data: {
                title: body.title,
                slug: body.slug,
                excerpt: body.excerpt,
                content: body.content,
                image: body.image,
                author: body.author,
                published: body.published,
                order: body.order,
            },
        });
        return NextResponse.json(post);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await prisma.blogPost.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
