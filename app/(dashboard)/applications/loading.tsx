import { ApplicationsSkeleton } from '@/app/components/PageSkeletons';

// Shown instantly while the page's server data loads.
export default function Loading() {
    return <ApplicationsSkeleton />;
}
