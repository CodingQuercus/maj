import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import ReportView from '@/app/components/ReportView';

export const metadata: Metadata = {
    title: 'Activity report',
};

export default async function ReportPage() {
    const supabase = await createClient();

    const { data: applications } = await supabase
        .from('job_applications')
        .select('*');

    return <ReportView applications={applications ?? []} />;
}
