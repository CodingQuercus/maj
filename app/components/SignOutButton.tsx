'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSignOut } from '@/lib/useSignOut';

// Full-width sign-out button for the account page.
export default function SignOutButton() {
    const { signOut, signingOut } = useSignOut();
    return (
        <Button
            variant="outline"
            className="w-full"
            onClick={signOut}
            loading={signingOut}
        >
            {!signingOut && <LogOut aria-hidden="true" />}
            {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
    );
}
