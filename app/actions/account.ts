'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Emails a password reset link. Used from the sign-in page ("Forgot password?") and the account page.
// Runs on the server so the shared demo account never triggers emails (its address doesn't exist
// and bounces can get the project's email sending restricted). The PKCE code verifier is stored as
// a cookie by the server client, so the link must be opened in the same browser.
export async function requestPasswordReset(
    email: string
): Promise<{ error: string } | undefined> {
    if (email.trim().toLowerCase() === process.env.DEMO_EMAIL?.toLowerCase()) {
        // Same response as a real request, so the demo address is treated like any other.
        return;
    }

    const headerList = await headers();
    const origin =
        headerList.get('origin') ??
        `${headerList.get('x-forwarded-proto') ?? 'http'}://${headerList.get('host')}`;

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // The callback exchanges the code from the email for a session, then opens the reset page.
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
        console.error('requestPasswordReset failed', error);
        return {
            error: 'Could not send reset link. Please try again in a moment.',
        };
    }
}

export async function deleteAccount() {
    // Create server client
    const supabase = await createClient();

    // Get the logged in user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // return if no user
    if (!user) return;

    if (user.email === process.env.DEMO_EMAIL) {
        throw new Error('Demo account cannot be deleted');
    }

    // Create admin client
    const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remove data. Stop here if it fails, so the user is never deleted with data left behind.
    const { error: dataError } = await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', user.id);
    if (dataError) {
        console.error(
            'deleteAccount: could not delete applications',
            dataError
        );
        throw new Error('Could not delete account data');
    }

    // Delete the user.
    const { error: userError } = await admin.auth.admin.deleteUser(user.id);
    if (userError) {
        console.error('deleteAccount: could not delete user', userError);
        throw new Error('Could not delete account');
    }

    // Sign out to clear the session.
    await supabase.auth.signOut();

    // Redirect user to login
    redirect('/');
}

// Sets a new password for the signed-in user (reached via the reset link in the email).
// Done on the server so the shared demo account's password can't be changed.
export async function updatePassword(
    password: string
): Promise<{ error: string } | undefined> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: 'Your reset link has expired. Please request a new one.',
        };
    }

    if (user.email === process.env.DEMO_EMAIL) {
        return { error: 'The demo account password cannot be changed.' };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };

    redirect('/applications');
}
