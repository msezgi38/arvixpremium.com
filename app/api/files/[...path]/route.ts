import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;
    const relativePath = segments.join('/');

    // Try uploads/ first, then public/ as fallback
    const uploadsPath = path.join(process.cwd(), 'uploads', ...segments);
    const publicPath = path.join(process.cwd(), 'public', ...segments);

    // Security: prevent path traversal
    const uploadsDir = path.resolve(path.join(process.cwd(), 'uploads'));
    const publicDir = path.resolve(path.join(process.cwd(), 'public'));
    const resolvedUploads = path.resolve(uploadsPath);
    const resolvedPublic = path.resolve(publicPath);

    let filePath: string | null = null;

    if (resolvedUploads.startsWith(uploadsDir) && fs.existsSync(resolvedUploads)) {
        filePath = resolvedUploads;
    } else if (resolvedPublic.startsWith(publicDir) && fs.existsSync(resolvedPublic)) {
        filePath = resolvedPublic;
    }

    if (!filePath) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
