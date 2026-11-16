import { ApplicationEvent, EventKind, Status } from './types';
import { todayLocal } from './dates';

export const EVENT_KINDS: EventKind[] = ['interview', 'assessment', 'other'];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
    interview: 'Interview',
    assessment: 'Assessment',
    other: 'Other',
};

// Colour of each kind, borrowed from the matching status (interviews look like the
// Interview status, assessments like Assessment); other events (calls, meetings…) stay neutral.
// Used as badge-<tone> classes and with STATUS_COLORS.
export const EVENT_KIND_TONE: Record<EventKind, Status> = {
    interview: 'interview',
    assessment: 'assessment',
    other: 'applied',
};

// "10:00" from the database's "10:00:00"; empty when no time is set.
export function formatTime(time: string | null): string {
    return time ? time.slice(0, 5) : '';
}

// Date, then time (events without a time first on their day, like all-day items).
export function compareEvents(
    a: ApplicationEvent,
    b: ApplicationEvent
): number {
    return (
        a.event_date.localeCompare(b.event_date) ||
        (a.start_time ?? '').localeCompare(b.start_time ?? '')
    );
}

// Today or later.
export function isUpcoming(event: ApplicationEvent): boolean {
    return event.event_date >= todayLocal();
}
