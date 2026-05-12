import { createClient } from '@/lib/supabase/server';
import DashboardView from '@/app/components/DashboardView';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: applications } = await supabase
        .from('job_applications')
        .select('status');

    return <DashboardView applications={applications ?? []} />;
}
