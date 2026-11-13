import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Landing route for links in Supabase emails (sign-up confirmation, password reset).
// Exchanges the one-time code for a session cookie, then sends the user on to `next`.
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get('code');

    // Only follow `next` if it stays on this site, to avoid open redirects
    // (e.g. "//evil.com" or "/\evil.com" both resolve to another origin).
    const next = new URL(searchParams.get('next') ?? '/applications', origin);
    const destination =
        next.origin === origin ? next : new URL('/applications', origin);

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(destination);
    }

    return NextResponse.redirect(new URL('/login?error=link', origin));
}
