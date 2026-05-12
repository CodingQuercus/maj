import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import ApplicationsView from '@/app/components/ApplicationsView';

export const metadata: Metadata = {
    title: 'Applications',
}

export default async function ApplicationsPage() {
    const supabase = await createClient();

    const { data: applications, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.log(error);
    }

    return <ApplicationsView applications={applications ?? []} />;
}
