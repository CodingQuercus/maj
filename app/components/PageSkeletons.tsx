import { Skeleton } from '@/components/ui/skeleton';

// Loading placeholders for the app routes (used by their loading.tsx files).
// They mirror the real layouts roughly so the page doesn't jump when content arrives.

function Container({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div
            role="status"
            aria-label={label}
            aria-busy="true"
            className="flex flex-col gap-4 p-3 sm:p-8"
        >
            {children}
        </div>
    );
}

// Icon + page title, like PageTitle.
function TitleSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="size-6 sm:size-8" />
            <Skeleton className="h-6 w-40 sm:h-8 sm:w-56" />
        </div>
    );
}

export function ApplicationsSkeleton() {
    return (
        <Container label="Loading applications">
            <div className="flex items-center justify-between">
                <TitleSkeleton />
                <Skeleton className="h-[34px] w-[34px] sm:w-40" />
            </div>
            <Skeleton className="h-9 w-full sm:w-80" />
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
            </div>
            <div className="mt-2 flex flex-col gap-3 sm:gap-0">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 sm:rounded-none sm:border-x-0 sm:border-t-0 sm:px-4 sm:py-3"
                    >
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-8">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="hidden h-4 w-24 lg:block" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </Container>
    );
}

export function ApplicationDetailSkeleton() {
    return (
        <Container label="Loading application">
            <Skeleton className="h-[30px] w-20" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-64 sm:h-9 sm:w-96" />
                <Skeleton className="h-[30px] w-16" />
            </div>
            <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-48" />
            <div className="mt-4 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-7 w-24 rounded-full"
                            />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex max-w-[700px] flex-col gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ))}
            </div>
        </Container>
    );
}

export function OverviewSkeleton() {
    return (
        <Container label="Loading overview">
            <TitleSkeleton />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Skeleton className="h-[260px] rounded-xl sm:h-[360px]" />
                <Skeleton className="h-[260px] rounded-xl sm:h-[360px]" />
            </div>
        </Container>
    );
}

export function CalendarSkeleton() {
    return (
        <Container label="Loading calendar">
            <TitleSkeleton />
            <Skeleton className="h-9 w-60" />
            <Skeleton className="h-[520px] rounded-xl" />
        </Container>
    );
}

export function ReportSkeleton() {
    return (
        <Container label="Loading monthly report">
            <TitleSkeleton />
            <div className="flex max-w-[900px] flex-col gap-4">
                <Skeleton className="h-9 w-60" />
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[320px] rounded-xl" />
            </div>
        </Container>
    );
}

export function AccountSkeleton() {
    return (
        <Container label="Loading account">
            <TitleSkeleton />
            <div className="flex max-w-[480px] flex-col gap-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
            </div>
        </Container>
    );
}
