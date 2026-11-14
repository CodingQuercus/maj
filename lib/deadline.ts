import { JobApplication } from './types';
import { daysUntil } from './dates';
import { OPEN_STATUSES } from './status';

export type DeadlineInfo = {
    days: number;
    label: string;
    // "soon" = three days or less, to highlight.
    urgent: boolean;
};

// How many days ahead a deadline is shown in the list.
export const DEADLINE_WINDOW_DAYS = 14;

// Upcoming deadline for an application that is still open, or null when there is
// none, it has passed, or the application is finished (offer, rejected, withdrawn).
export function upcomingDeadline(
    application: Pick<JobApplication, 'deadline' | 'status'>,
    windowDays: number = DEADLINE_WINDOW_DAYS
): DeadlineInfo | null {
    if (!application.deadline || !OPEN_STATUSES.includes(application.status))
        return null;
    const days = daysUntil(application.deadline);
    if (days < 0 || days > windowDays) return null;
    const label =
        days === 0
            ? 'Due today'
            : days === 1
              ? 'Due tomorrow'
              : `Due in ${days} days`;
    return { days, label, urgent: days <= 3 };
}
