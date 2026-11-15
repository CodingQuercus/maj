import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import ReportView from '@/app/components/ReportView';
import { parseDueDay } from '@/lib/report';

export const metadata: Metadata = {
    title: 'Monthly report',
};

export default async function ReportPage() {
    const supabase = await createClient();

    const [
        { data: applications },
        {
            data: { user },
        },
    ] = await Promise.all([
        supabase.from('job_applications').select('*'),
        supabase.auth.getUser(),
    ]);

    return (
        <ReportView
            applications={applications ?? []}
            dueDay={parseDueDay(user?.user_metadata?.report_due_day)}
        />
    );
}
