import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    // Standard response if nothing happens.
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Creates a Supabase client for use in middleware.
    // Unlike server components, middleware can both read and write cookies,
    // which is required for session refresh.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                // Read all cookies from incoming request.
                getAll() {
                    return request.cookies.getAll();
                },
                // Write cookies for both request and response.
                // Unlike server components, middleware is not read-only,
                // so no try/catch is needed here.
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Gets the logged in user. getUser verifies JWT-token against Supabase.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If user is not logged in and tries to visit a protected route, send them to login.
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/'
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // If user is logged in and tries to visit the start page, send to applications.
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/applications';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

// Defines which routes middleware runs on. Static resources excluded.
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
