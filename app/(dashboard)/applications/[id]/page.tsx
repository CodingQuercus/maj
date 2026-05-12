import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ApplicationDetail from '@/app/components/ApplicationDetail';

// Function to generate dynamic page title for application view
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase
        .from('job_applications')
        .select('title')
        .eq('id', id)
        .single()

    return {
        title: data ? `${data.title}` : 'Application',
    }
}

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: application, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !application) notFound();

    return <ApplicationDetail application={application} />;
}
