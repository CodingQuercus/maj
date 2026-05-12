import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ApplicationDetail from '@/app/components/ApplicationDetail';

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
