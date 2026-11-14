import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import OverviewView from '@/app/components/OverviewView';

export const metadata: Metadata = {
    title: 'Overview',
}

export default async function OverviewPage() {
    const supabase = await createClient();

    const { data: applications } = await supabase
        .from('job_applications')
        .select('*');

    return <OverviewView applications={applications ?? []} />;
}
