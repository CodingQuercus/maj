'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

// Signs the user out and returns to the start page. Shared by the sidebar and the
// account page's sign-out button (used on phones, where the bottom bar has none).
export function useSignOut() {
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    const signOut = async () => {
        setSigningOut(true);
        const { error } = await createClient().auth.signOut();
        if (error) {
            setSigningOut(false);
            toast.error('Could not sign out. Please try again.');
            return;
        }
        router.push('/');
        router.refresh();
    };

    return { signOut, signingOut };
}
