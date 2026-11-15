'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatDate, todayLocal } from '@/lib/dates';
import { deleteEventWithUndo } from '@/lib/eventActions';
import {
    EVENT_KIND_LABELS,
    EVENT_KIND_TONE,
    compareEvents,
    formatTime,
    isUpcoming,
} from '@/lib/events';
import { ApplicationEvent, Status } from '@/lib/types';
import { cn } from '@/lib/utils';
import EventForm from './EventForm';
import SectionLabel from './SectionLabel';

type EventsSectionProps = {
    applicationId: string;
    status: Status;
    // Loaded on the server together with the application.
    initialEvents: ApplicationEvent[];
};

// Interviews, tests, calls etc. for one application: listed by date, added and edited
// inline (like contacts), removed with Undo. They also show in the calendar.
export default function EventsSection({
    applicationId,
    status,
    initialEvents,
}: EventsSectionProps) {
    const [events, setEvents] = useState(() =>
        [...initialEvents].sort(compareEvents)
    );
    // null = form closed, 'new' = adding, otherwise the id of the event being edited.
    const [editing, setEditing] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const upsert = (event: ApplicationEvent) =>
        setEvents((prev) =>
            [...prev.filter((e) => e.id !== event.id), event].sort(
                compareEvents
            )
        );

    // Adding an interview while the status is still earlier offers to move it on, but never
    // changes the status by itself.
    const setStatusToInterview = async () => {
        const { error } = await supabase
            .from('job_applications')
            .update({
                status: 'interview',
                // A saved job with an interview has been applied for: date it today.
                ...(status === 'saved' && {
                    applied_at: new Date(todayLocal()).toISOString(),
                }),
            })
            .eq('id', applicationId);
        if (error) {
            toast.error('Could not update status. Please try again.');
            return;
        }
        toast.success('Status set to Interview');
        router.refresh();
    };

    const onSaved = (event: ApplicationEvent, isNew: boolean) => {
        upsert(event);
        setEditing(null);
        const suggest =
            isNew &&
            event.kind === 'interview' &&
            (status === 'saved' ||
                status === 'applied' ||
                status === 'assessment');
        toast.success(
            isNew ? 'Event added' : 'Event updated',
            suggest
                ? {
                      duration: 8000,
                      action: {
                          label: 'Set status to Interview',
                          onClick: setStatusToInterview,
                      },
                  }
                : undefined
        );
    };

    const remove = async (event: ApplicationEvent) => {
        setDeletingId(event.id);
        const deleted = await deleteEventWithUndo(event, {
            onRestored: upsert,
        });
        setDeletingId(null);
        if (!deleted) return;
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        if (editing === event.id) setEditing(null);
    };

    const form = (event?: ApplicationEvent) => (
        <div className="mb-4 max-w-[480px] rounded-lg bg-muted p-4">
            <EventForm
                idPrefix={event ? `event-${event.id}` : 'event-new'}
                applicationId={applicationId}
                event={event}
                onSaved={onSaved}
                onCancel={() => setEditing(null)}
            />
        </div>
    );

    return (
        <section className="py-4">
            <div className="mb-3 flex max-w-[600px] items-center justify-between">
                <SectionLabel
                    icon={<CalendarClock size={16} />}
                    label="Events"
                    noMargin
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(editing === 'new' ? null : 'new')}
                    aria-expanded={editing === 'new'}
                >
                    <Plus size={14} aria-hidden="true" />
                    Add event
                </Button>
            </div>

            {editing === 'new' && form()}

            {events.length === 0 && editing !== 'new' && (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    No interviews or other events yet.
                </p>
            )}

            {/* Capped width so the edit and delete buttons stay next to the text on wide screens. */}
            <ul className="flex max-w-[600px] flex-col gap-2">
                {events.map((event) =>
                    editing === event.id ? (
                        <li key={event.id}>{form(event)}</li>
                    ) : (
                        <li
                            key={event.id}
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3',
                                !isUpcoming(event) && 'opacity-70'
                            )}
                        >
                            <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                                    <span
                                        className={`badge badge-dot badge-${EVENT_KIND_TONE[event.kind]}`}
                                    >
                                        {EVENT_KIND_LABELS[event.kind]}
                                    </span>
                                    <span className="text-[var(--color-text-secondary)] tabular-nums">
                                        {formatDate(event.event_date)}
                                        {event.start_time &&
                                            ` · ${formatTime(event.start_time)}`}
                                    </span>
                                    {!isUpcoming(event) && (
                                        <span className="text-xs text-[var(--color-text-tertiary)]">
                                            Past
                                        </span>
                                    )}
                                </p>
                                {event.note && (
                                    <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                                        {event.note}
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Edit ${EVENT_KIND_LABELS[event.kind].toLowerCase()} on ${formatDate(event.event_date)}`}
                                    onClick={() => setEditing(event.id)}
                                >
                                    <Pencil size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Delete ${EVENT_KIND_LABELS[event.kind].toLowerCase()} on ${formatDate(event.event_date)}`}
                                    onClick={() => remove(event)}
                                    loading={deletingId === event.id}
                                >
                                    {deletingId !== event.id && (
                                        <Trash2
                                            size={14}
                                            aria-hidden="true"
                                            className="text-destructive"
                                        />
                                    )}
                                </Button>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </section>
    );
}
