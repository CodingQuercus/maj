import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import OverviewView from '@/app/components/OverviewView';
import { CalendarEvent } from '@/lib/types';

export const metadata: Metadata = {
    title: 'Overview',
};

export default async function OverviewPage() {
    const supabase = await createClient();

    const [{ data: applications }, { data: events }] = await Promise.all([
        supabase.from('job_applications').select('*'),
        supabase
            .from('events')
            .select('*, job_applications(id, title, company)'),
    ]);

    return (
        <OverviewView
            applications={applications ?? []}
            events={(events ?? []) as CalendarEvent[]}
        />
    );
}
