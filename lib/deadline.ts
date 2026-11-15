import { JobApplication } from './types';
import { daysUntil } from './dates';

// A deadline is the last day to apply, so it only matters for saved jobs (not applied
// yet). Once a job is applied for, its deadline is no longer shown.

export type DeadlineInfo = {
    days: number;
    label: string;
    // "soon" = three days or less, to highlight.
    urgent: boolean;
};

// How many days ahead a deadline is shown in the list.
export const DEADLINE_WINDOW_DAYS = 14;

type DeadlineFields = Pick<JobApplication, 'deadline' | 'status'>;

// Upcoming deadline for a saved job, or null when there is none, it has passed, it is
// further away than `windowDays`, or the job has been applied for.
export function upcomingDeadline(
    application: DeadlineFields,
    windowDays: number = DEADLINE_WINDOW_DAYS
): DeadlineInfo | null {
    if (!application.deadline || application.status !== 'saved') return null;
    const days = daysUntil(application.deadline);
    if (days < 0 || days > windowDays) return null;
    const label =
        days === 0
            ? 'Apply today'
            : days === 1
              ? 'Apply by tomorrow'
              : `Apply within ${days} days`;
    return { days, label, urgent: days <= 3 };
}

// A saved job whose last day to apply has gone by. Nothing happens to it automatically;
// the user decides (mark as applied or delete).
export function deadlinePassed(application: DeadlineFields): boolean {
    return (
        application.status === 'saved' &&
        !!application.deadline &&
        daysUntil(application.deadline) < 0
    );
}
