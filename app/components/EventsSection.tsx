'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { formatDate, todayLocal } from '@/lib/dates';
import {
    EVENT_KINDS,
    EVENT_KIND_LABELS,
    compareEvents,
    formatTime,
    isUpcoming,
} from '@/lib/events';
import { ApplicationEvent, EventKind, Status } from '@/lib/types';
import { cn } from '@/lib/utils';
import DatePicker from './DatePicker';
import SectionLabel from './SectionLabel';

type EventsSectionProps = {
    applicationId: string;
    status: Status;
    // Loaded on the server together with the application.
    initialEvents: ApplicationEvent[];
};

type Draft = {
    kind: EventKind;
    date: string;
    time: string; // "HH:MM" or ""
    note: string;
};

const emptyDraft = (): Draft => ({
    kind: 'interview',
    date: todayLocal(),
    time: '',
    note: '',
});

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
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft((d) => ({ ...d, [key]: value }));

    const openNew = () => {
        setDraft(emptyDraft());
        setError(null);
        setEditing(editing === 'new' ? null : 'new');
    };

    const openEdit = (event: ApplicationEvent) => {
        setDraft({
            kind: event.kind,
            date: event.event_date,
            time: formatTime(event.start_time),
            note: event.note ?? '',
        });
        setError(null);
        setEditing(event.id);
    };

    // Adding an interview while the status is still earlier offers to move it on, but never
    // changes the status by itself.
    const suggestInterviewStatus = (kind: EventKind) =>
        kind === 'interview' && (status === 'applied' || status === 'assessment');

    const setStatusToInterview = async () => {
        const { error } = await supabase
            .from('job_applications')
            .update({ status: 'interview' })
            .eq('id', applicationId);
        if (error) {
            toast.error('Could not update status. Please try again.');
            return;
        }
        toast.success('Status set to Interview');
        router.refresh();
    };

    const save = async () => {
        if (!draft.date) {
            setError('Pick a date.');
            return;
        }
        setError(null);
        setSaving(true);
        const values = {
            kind: draft.kind,
            event_date: draft.date,
            start_time: draft.time || null,
            note: draft.note.trim() || null,
        };
        const query =
            editing === 'new'
                ? supabase
                      .from('events')
                      .insert({ ...values, job_application_id: applicationId })
                : supabase.from('events').update(values).eq('id', editing!);
        const { data, error } = await query.select().single();
        setSaving(false);

        if (error) {
            setError('Could not save the event. Please try again.');
            return;
        }

        const isNew = editing === 'new';
        setEvents((prev) =>
            [...prev.filter((e) => e.id !== data.id), data].sort(compareEvents)
        );
        setEditing(null);
        toast.success(
            isNew ? 'Event added' : 'Event updated',
            isNew && suggestInterviewStatus(data.kind)
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

    const remove = async (id: string) => {
        setDeletingId(id);
        const { error } = await supabase.from('events').delete().eq('id', id);
        setDeletingId(null);
        if (error) {
            toast.error('Could not delete the event. Please try again.');
            return;
        }
        const removed = events.find((e) => e.id === id);
        setEvents((prev) => prev.filter((e) => e.id !== id));
        if (editing === id) setEditing(null);
        toast.success('Event removed', {
            // Longer than the default 4s so there is time to reach the Undo button.
            duration: 8000,
            action: removed && {
                label: 'Undo',
                onClick: () => restore(removed),
            },
        });
    };

    // Re-creates the event with its original id, so it comes back exactly as it was.
    const restore = async (event: ApplicationEvent) => {
        const { data, error } = await supabase
            .from('events')
            .insert(event)
            .select()
            .single();
        if (error) {
            toast.error('Could not restore the event. Please add it again.');
            return;
        }
        setEvents((prev) => [...prev, data].sort(compareEvents));
        toast.success('Event restored');
    };

    const form = (
        <div className="mb-4 flex max-w-[480px] flex-col gap-3 rounded-lg bg-muted p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <Label htmlFor="event-kind">Type</Label>
                    <Select
                        value={draft.kind}
                        onValueChange={(v) => set('kind', v as EventKind)}
                    >
                        <SelectTrigger id="event-kind" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_KINDS.map((k) => (
                                <SelectItem key={k} value={k}>
                                    {EVENT_KIND_LABELS[k]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="event-date">Date</Label>
                    <DatePicker
                        id="event-date"
                        label="Date"
                        value={draft.date}
                        onChange={(v) => set('date', v)}
                    />
                </div>
                <div>
                    <Label htmlFor="event-time">Time (optional)</Label>
                    <Input
                        id="event-time"
                        type="time"
                        value={draft.time}
                        onChange={(e) => set('time', e.target.value)}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="event-note">Note (optional)</Label>
                <Input
                    id="event-note"
                    placeholder="e.g. Video call with the team lead"
                    value={draft.note}
                    onChange={(e) => set('note', e.target.value)}
                />
            </div>
            {error && (
                <p className="field-error" role="alert">
                    {error}
                </p>
            )}
            <div className="flex gap-2">
                <Button size="sm" onClick={save} loading={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(null)}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );

    return (
        <section className="py-4">
            <div className="mb-3 flex items-center justify-between">
                <SectionLabel
                    icon={<CalendarClock size={16} />}
                    label="Events"
                    noMargin
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={openNew}
                    aria-expanded={editing === 'new'}
                >
                    <Plus size={14} aria-hidden="true" />
                    Add
                </Button>
            </div>

            {editing === 'new' && form}

            {events.length === 0 && editing !== 'new' && (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    No interviews or other events yet.
                </p>
            )}

            <ul className="flex flex-col gap-2">
                {events.map((event) =>
                    editing === event.id ? (
                        <li key={event.id}>{form}</li>
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
                                    <span className="font-medium text-foreground">
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
                                    onClick={() => openEdit(event)}
                                >
                                    <Pencil size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Delete ${EVENT_KIND_LABELS[event.kind].toLowerCase()} on ${formatDate(event.event_date)}`}
                                    onClick={() => remove(event.id)}
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
