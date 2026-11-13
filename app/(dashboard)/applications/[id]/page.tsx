import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Contact, JobApplication } from '@/lib/types';
import ApplicationDetail from '@/app/components/ApplicationDetail';

// Function to generate dynamic page title for application view
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from('job_applications')
        .select('title')
        .eq('id', id)
        .single();

    return {
        title: data ? `${data.title}` : 'Application',
    };
}

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Contacts come in the same query (via the job_application_id foreign key),
    // so the page renders complete instead of loading them afterwards in the browser.
    const { data, error } = await supabase
        .from('job_applications')
        .select('*, contacts(*)')
        .eq('id', id)
        .order('created_at', { referencedTable: 'contacts', ascending: true })
        .single();

    if (error || !data) notFound();

    const { contacts, ...application } = data as JobApplication & {
        contacts: Contact[];
    };

    return (
        <ApplicationDetail
            application={application}
            initialContacts={contacts}
        />
    );
}
