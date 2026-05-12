import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Creates a Supabase client for use in server components and server actions
// Reads and writes cookies to maintain the user session.
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                // Read all cookies from incoming request
                getAll() {
                    return cookieStore.getAll();
                },
                // Write cookies. Wrapped in try catch because
                // cookies() is read-only in some server contexts (e.g. middleware)
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {}
                },
            },
        }
    );
}
