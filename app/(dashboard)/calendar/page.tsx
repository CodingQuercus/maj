import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import CalendarView from '@/app/components/CalendarView';
import { CalendarEvent } from '@/lib/types';

export const metadata: Metadata = {
    title: 'Calendar',
};

export default async function CalendarPage() {
    const supabase = await createClient();

    // All events with their application, and the dates the calendar shows for applications.
    const [{ data: events }, { data: applications }] = await Promise.all([
        supabase
            .from('events')
            .select('*, job_applications(id, title, company)'),
        supabase
            .from('job_applications')
            .select('id, title, company, status, applied_at, deadline'),
    ]);

    return (
        <CalendarView
            events={(events ?? []) as CalendarEvent[]}
            applications={applications ?? []}
        />
    );
}
