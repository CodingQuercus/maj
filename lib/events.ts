import { ApplicationEvent, EventKind } from './types';
import { todayLocal } from './dates';

export const EVENT_KINDS: EventKind[] = ['interview', 'assessment', 'call', 'other'];

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
    interview: 'Interview',
    assessment: 'Assessment',
    call: 'Call',
    other: 'Other',
};

// "10:00" from the database's "10:00:00"; empty when no time is set.
export function formatTime(time: string | null): string {
    return time ? time.slice(0, 5) : '';
}

// Date, then time (events without a time first on their day, like all-day items).
export function compareEvents(a: ApplicationEvent, b: ApplicationEvent): number {
    return (
        a.event_date.localeCompare(b.event_date) ||
        (a.start_time ?? '').localeCompare(b.start_time ?? '')
    );
}

// Today or later.
export function isUpcoming(event: ApplicationEvent): boolean {
    return event.event_date >= todayLocal();
}
