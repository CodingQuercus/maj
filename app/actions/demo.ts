'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAsDemo() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: process.env.DEMO_EMAIL!,
        password: process.env.DEMO_PASSWORD!,
    });

    // Previously the error was ignored and the redirect bounced the user back to the
    // start page without explanation. The login page shows a message for ?error=demo.
    if (error) {
        console.error('loginAsDemo failed', error);
        redirect('/login?error=demo');
    }

    redirect('/applications');
}
