import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import DashboardView from '@/app/components/DashboardView';

export const metadata: Metadata = {
    title: 'Dashboard',
}

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: applications } = await supabase
        .from('job_applications')
        .select('status');

    return <DashboardView applications={applications ?? []} />;
}
