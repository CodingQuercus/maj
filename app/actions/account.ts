'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function deleteAccount() {

    // Create server client
    const supabase = await createClient();

    // Get the logged in user
    const { data: { user } } = await supabase.auth.getUser();

    // return if no user
    if(!user) return;

    if (user.email === process.env.DEMO_EMAIL) {
        throw new Error('Demo account cannot be deleted');
    }

    // Create admin client
    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Remove data
    await supabase.from('job_applications').delete().eq('user_id', user.id);

    // Delete the user.
    await admin.auth.admin.deleteUser(user.id);

    // Sign out to clear the session.
    await supabase.auth.signOut();

    // Redirect user to login
    redirect('/');
}