'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';
import { deleteEventWithUndo } from '@/lib/eventActions';
import { CalendarEvent } from '@/lib/types';
import EventForm, { type ApplicationOption } from './EventForm';

type EventDrawerProps = {
    open: boolean;
    onClose: () => void;
    applications: ApplicationOption[];
    // The event to edit, or nothing to add one.
    event?: CalendarEvent;
    // Date for a new event.
    defaultDate?: string;
};

// Add, edit or delete an event from the calendar, picking the application it belongs to.
// The calendar's data comes from the server, so it is refreshed after each change.
export default function EventDrawer({
    open,
    onClose,
    applications,
    event,
    defaultDate,
}: EventDrawerProps) {
    const router = useRouter();
    const openerRef = useRef<HTMLElement | null>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const done = () => {
        router.refresh();
        onClose();
    };

    const remove = async () => {
        if (!event) return;
        const deleted = await deleteEventWithUndo(event, {
            onRestored: () => router.refresh(),
        });
        if (deleted) done();
    };

    return (
        <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent
                side="right"
                showCloseButton={false}
                aria-describedby={undefined}
                // Focus the first field, and remember the opener to return focus to (the
                // drawer opens from plain buttons, so Radix has no trigger to go back to).
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    openerRef.current =
                        document.activeElement as HTMLElement | null;
                    bodyRef.current
                        ?.querySelector<HTMLElement>('button, input')
                        ?.focus({ preventScroll: true });
                }}
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    openerRef.current?.focus({ preventScroll: true });
                }}
                className="w-full gap-0 sm:max-w-[480px]"
            >
                <div className="flex items-center justify-between border-b border-border p-4">
                    <SheetTitle className="text-lg">
                        {event ? 'Edit event' : 'Add event'}
                    </SheetTitle>
                    <SheetClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close drawer"
                        >
                            <X size={16} />
                        </Button>
                    </SheetClose>
                </div>

                <div
                    ref={bodyRef}
                    className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4"
                >
                    {event && (
                        <Link
                            href={`/applications/${event.job_applications.id}`}
                            className="flex items-center gap-2 text-sm"
                        >
                            <ExternalLink size={14} aria-hidden="true" />
                            {event.job_applications.title} ·{' '}
                            {event.job_applications.company}
                        </Link>
                    )}
                    <EventForm
                        // A fresh form for each event or day the drawer opens for.
                        key={event?.id ?? `new-${defaultDate}`}
                        idPrefix="drawer-event"
                        applications={event ? undefined : applications}
                        applicationId={event?.job_application_id}
                        event={event}
                        defaultDate={defaultDate}
                        onSaved={(_, isNew) => {
                            toast.success(
                                isNew ? 'Event added' : 'Event updated'
                            );
                            done();
                        }}
                        onCancel={onClose}
                        extraActions={
                            event && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={remove}
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                    Delete
                                </Button>
                            )
                        }
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
