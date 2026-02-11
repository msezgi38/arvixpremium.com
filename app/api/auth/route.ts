import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'admin@arvix.com';
const ADMIN_PASSWORD = 'Arvix2026*';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });
            response.cookies.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            return response;
        }

        return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = request.cookies.get('admin_session');
    if (session?.value === 'authenticated') {
        return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    return response;
}
