'use client';

import { type ReactNode, useMemo, useState } from 'react';

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
import { todayLocal } from '@/lib/dates';
import { EVENT_KINDS, EVENT_KIND_LABELS, formatTime } from '@/lib/events';
import { ApplicationEvent, EventKind, JobApplication } from '@/lib/types';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

export type ApplicationOption = Pick<
    JobApplication,
    'id' | 'title' | 'company'
>;

type EventFormProps = {
    // Prefix for field ids, so two forms on a page don't clash.
    idPrefix: string;
    // Either a fixed application (its own page) or a list to pick from (the calendar).
    applicationId?: string;
    applications?: ApplicationOption[];
    // The event being edited, or nothing for a new one.
    event?: ApplicationEvent;
    // Date for a new event (e.g. the calendar day it was opened from); today by default.
    defaultDate?: string;
    onSaved: (event: ApplicationEvent, isNew: boolean) => void;
    onCancel: () => void;
    // More buttons at the end of the action row (e.g. Delete).
    extraActions?: ReactNode;
};

// Fields for an event (application, type, date, optional time and note) and saving it.
// Used inline on an application's page and in the calendar's drawer.
export default function EventForm({
    idPrefix,
    applicationId,
    applications,
    event,
    defaultDate,
    onSaved,
    onCancel,
    extraActions,
}: EventFormProps) {
    const [appId, setAppId] = useState(
        event?.job_application_id ?? applicationId ?? ''
    );
    const [kind, setKind] = useState<EventKind>(event?.kind ?? 'interview');
    const [date, setDate] = useState(
        event?.event_date ?? defaultDate ?? todayLocal()
    );
    const [time, setTime] = useState(formatTime(event?.start_time ?? null));
    const [note, setNote] = useState(event?.note ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = useMemo(() => createClient(), []);
    const id = (name: string) => `${idPrefix}-${name}`;

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appId) {
            setError('Pick the application this is for.');
            return;
        }
        if (!date) {
            setError('Pick a date.');
            return;
        }
        setError(null);
        setSaving(true);
        const values = {
            job_application_id: appId,
            kind,
            event_date: date,
            start_time: time || null,
            note: note.trim() || null,
        };
        const query = event
            ? supabase.from('events').update(values).eq('id', event.id)
            : supabase.from('events').insert(values);
        const { data, error } = await query.select().single();
        setSaving(false);
        if (error) {
            setError('Could not save the event. Please try again.');
            return;
        }
        onSaved(data, !event);
    };

    return (
        <form onSubmit={save} className="flex flex-col gap-3">
            {applications && (
                <div>
                    <Label htmlFor={id('application')}>Application</Label>
                    {applications.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                            Add an application first; events belong to one.
                        </p>
                    ) : (
                        <Select value={appId} onValueChange={setAppId}>
                            <SelectTrigger
                                id={id('application')}
                                className="w-full"
                            >
                                <SelectValue placeholder="Pick an application" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                                {applications.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.title} · {a.company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <Label htmlFor={id('kind')}>Type</Label>
                    <Select
                        value={kind}
                        onValueChange={(v) => setKind(v as EventKind)}
                    >
                        <SelectTrigger id={id('kind')} className="w-full">
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
                    <Label htmlFor={id('date')}>Date</Label>
                    <DatePicker
                        id={id('date')}
                        label="Date"
                        value={date}
                        onChange={setDate}
                    />
                </div>
                <div>
                    <Label htmlFor={id('time')}>Time</Label>
                    <TimePicker
                        id={id('time')}
                        label="Time"
                        value={time}
                        onChange={setTime}
                    />
                </div>
            </div>
            <div>
                <Label htmlFor={id('note')}>Note (optional)</Label>
                <Input
                    id={id('note')}
                    placeholder="e.g. Video call with the team lead"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
            {error && (
                <p className="field-error" role="alert">
                    {error}
                </p>
            )}
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm" loading={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                {extraActions && (
                    <div className="ml-auto flex gap-2">{extraActions}</div>
                )}
            </div>
        </form>
    );
}
