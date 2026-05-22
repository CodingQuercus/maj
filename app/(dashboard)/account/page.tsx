import { Metadata } from 'next';
import AccountView from '@/app/components/AccountView';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
    title: 'Account',
}

export default async function AccountPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <AccountView 
            email={user?.email ?? ''} 
            createdAt={user?.created_at ?? ''} 
        />
    );
}
