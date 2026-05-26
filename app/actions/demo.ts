'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAsDemo() {
    const supabase = await createClient();
    
    await supabase.auth.signInWithPassword({
        email: process.env.DEMO_EMAIL!,
        password: process.env.DEMO_PASSWORD!,
    });

    redirect('/applications');
}