'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Flag, Plus } from 'lucide-react';

import EventDrawer from './EventDrawer';
import MonthPicker from './MonthPicker';
import PageTitle from './PageTitle';
import { Button } from '@/components/ui/button';
import { WEEKDAYS, formatAgendaDay, monthWeeks } from '@/lib/calendar';
import { dateKey, todayLocal } from '@/lib/dates';
import { EVENT_KIND_LABELS, compareEvents, formatTime } from '@/lib/events';
import { currentMonth, formatMonth, isMonthKey } from '@/lib/report';
import { OPEN_STATUSES } from '@/lib/status';
import { CalendarEvent, JobApplication } from '@/lib/types';
import { cn } from '@/lib/utils';

type CalendarViewProps = {
    events: CalendarEvent[];
    applications: Pick<
        JobApplication,
        'id' | 'title' | 'company' | 'status' | 'applied_at' | 'deadline'
    >[];
};

type Day = {
    events: CalendarEvent[];
    deadlines: CalendarViewProps['applications'];
};

// What the drawer is open for: a new event (on a date) or an existing one.
type DrawerState =
    | { open: false }
    | { open: true; date: string; event?: undefined }
    | { open: true; event: CalendarEvent; date?: undefined };

// Two columns: a month calendar to pick a day, and that day's schedule (events by time,
// then deadlines of open applications). Stacked on phones. One Add button, for the picked
// day. Events are added, edited and deleted in a drawer, or on an application's page.
// The month lives in the URL (?month=2026-11).
export default function CalendarView({
    events,
    applications,
}: CalendarViewProps) {
    const searchParams = useSearchParams();
    const param = searchParams.get('month');
    const thisMonth = currentMonth();
    const month = isMonthKey(param) ? param : thisMonth;
    const today = todayLocal();
    const [drawer, setDrawer] = useState<DrawerState>({ open: false });
    const [picked, setPicked] = useState<string | null>(null);

    // Everything by date.
    const days = new Map<string, Day>();
    const dayFor = (key: string) => {
        if (!days.has(key)) days.set(key, { events: [], deadlines: [] });
        return days.get(key)!;
    };
    for (const event of [...events].sort(compareEvents)) {
        dayFor(event.event_date).events.push(event);
    }
    for (const app of applications) {
        if (app.deadline && OPEN_STATUSES.includes(app.status)) {
            dayFor(dateKey(app.deadline)).deadlines.push(app);
        }
    }

    // The day shown: the one picked in this month; otherwise today in the current month,
    // or the first day with something on it (else the 1st) in another month.
    const firstBusyDay = [...days.keys()]
        .filter((key) => key.startsWith(month))
        .sort()[0];
    const selected = picked?.startsWith(month)
        ? picked
        : month === thisMonth
          ? today
          : (firstBusyDay ?? `${month}-01`);

    const setMonth = (next: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next === thisMonth) params.delete('month');
        else params.set('month', next);
        const query = params.toString();
        window.history.replaceState(null, '', query ? `?${query}` : '?');
        setPicked(null);
    };

    // Picker in the drawer: most recently applied first.
    const options = [...applications].sort((a, b) =>
        (b.applied_at ?? '').localeCompare(a.applied_at ?? '')
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-4 flex items-center justify-between sm:mb-8">
                <PageTitle icon={<CalendarDays />} title="Calendar" noMargin />
                <Button
                    onClick={() => setDrawer({ open: true, date: selected })}
                    aria-label={`Add event on ${selected}`}
                    className="size-[34px] p-0 sm:w-auto sm:px-4"
                >
                    <Plus size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">Add event</span>
                </Button>
            </div>
            <hr />

            <div className="flex flex-col gap-4">
                <MonthPicker
                    month={month}
                    onChange={setMonth}
                    resetLabel="Today"
                />

                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <MonthGrid
                        month={month}
                        today={today}
                        days={days}
                        selected={selected}
                        onSelect={setPicked}
                    />
                    <DaySchedule
                        dayKey={selected}
                        isToday={selected === today}
                        day={days.get(selected)}
                        onEdit={(event) => setDrawer({ open: true, event })}
                    />
                </div>
            </div>

            <EventDrawer
                open={drawer.open}
                onClose={() => setDrawer({ open: false })}
                applications={options}
                event={drawer.open ? drawer.event : undefined}
                defaultDate={drawer.open ? drawer.date : undefined}
            />
        </div>
    );
}

// Dates of the month with a dot for events and a ring for deadlines (shape, not only
// colour, tells them apart). Picking a date shows its schedule.
function MonthGrid({
    month,
    today,
    days,
    selected,
    onSelect,
}: {
    month: string;
    today: string;
    days: Map<string, Day>;
    selected: string;
    onSelect: (day: string) => void;
}) {
    // Read out with each date, e.g. "1 event, 1 deadline".
    const summary = (d: Day | undefined) =>
        [
            d?.events.length &&
                `${d.events.length} event${d.events.length === 1 ? '' : 's'}`,
            d?.deadlines.length &&
                `${d.deadlines.length} deadline${d.deadlines.length === 1 ? '' : 's'}`,
        ]
            .filter(Boolean)
            .join(', ');

    return (
        <div className="rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-xs)] sm:p-3">
            <div
                aria-hidden="true"
                className="grid grid-cols-7 pb-1 text-center text-[11px] tracking-wider text-[var(--color-text-tertiary)] uppercase"
            >
                {WEEKDAYS.map((d) => (
                    <span key={d}>
                        <span className="sm:hidden">{d.slice(0, 2)}</span>
                        <span className="hidden sm:inline">{d}</span>
                    </span>
                ))}
            </div>
            <div
                role="group"
                aria-label={formatMonth(month)}
                className="grid grid-cols-7"
            >
                {monthWeeks(month)
                    .flat()
                    .map((key) => {
                        if (!key.startsWith(month))
                            return <span key={key} aria-hidden="true" />;
                        const d = days.get(key);
                        const isSelected = key === selected;
                        const isToday = key === today;
                        const info = summary(d);
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={`${formatAgendaDay(key)}${isToday ? ', today' : ''}${info ? `, ${info}` : ''}`}
                                onClick={() => onSelect(key)}
                                className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg outline-none hover:bg-[var(--color-surface)] focus-ring sm:h-14 lg:h-16"
                            >
                                <span
                                    className={cn(
                                        'inline-flex size-8 items-center justify-center rounded-full text-sm tabular-nums',
                                        isSelected
                                            ? 'bg-primary font-semibold text-primary-foreground'
                                            : isToday
                                              ? 'font-semibold text-primary'
                                              : 'text-foreground'
                                    )}
                                >
                                    {Number(key.slice(8))}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="flex h-1.5 gap-0.5"
                                >
                                    {d && d.events.length > 0 && (
                                        <span className="size-1.5 rounded-full bg-primary" />
                                    )}
                                    {d && d.deadlines.length > 0 && (
                                        <span className="size-1.5 rounded-full border border-[var(--color-text-tertiary)]" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}

// One day: events in time order (those without a time first, as "All day"), then
// deadlines. Events open for editing; deadlines go to their application.
function DaySchedule({
    dayKey,
    isToday,
    day,
    onEdit,
}: {
    dayKey: string;
    isToday: boolean;
    day: Day | undefined;
    onEdit: (event: CalendarEvent) => void;
}) {
    const empty =
        !day || (day.events.length === 0 && day.deadlines.length === 0);
    const row =
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors';
    const timeCol =
        'w-14 shrink-0 pt-px text-xs text-[var(--color-text-tertiary)] tabular-nums';

    return (
        <section
            aria-labelledby="day-heading"
            className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-xs)] md:sticky md:top-4"
        >
            <h3
                id="day-heading"
                aria-live="polite"
                className={cn(
                    'mb-3 text-[length:var(--text-md)] tabular-nums',
                    isToday && 'text-primary'
                )}
            >
                {formatAgendaDay(dayKey)}
                {isToday && ' · Today'}
            </h3>

            {empty ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    Nothing planned.
                </p>
            ) : (
                <ul className="-mx-1 flex flex-col gap-1">
                    {day!.events.map((e) => (
                        <li key={e.id}>
                            <button
                                type="button"
                                onClick={() => onEdit(e)}
                                className={cn(
                                    row,
                                    'cursor-pointer bg-[var(--color-accent-subtle)] outline-none hover:bg-[var(--color-accent-border)] focus-ring'
                                )}
                            >
                                <span className={timeCol}>
                                    {formatTime(e.start_time) || 'All day'}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-[var(--color-accent-text)]">
                                        {EVENT_KIND_LABELS[e.kind]}
                                    </span>
                                    <span className="block truncate text-[var(--color-text-secondary)]">
                                        {e.job_applications.title} ·{' '}
                                        {e.job_applications.company}
                                    </span>
                                    {e.note && (
                                        <span className="block truncate text-xs text-[var(--color-text-tertiary)]">
                                            {e.note}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                    {day!.deadlines.map((a) => (
                        <li key={a.id}>
                            <Link
                                href={`/applications/${a.id}`}
                                className={cn(
                                    row,
                                    'border border-border no-underline hover:bg-accent'
                                )}
                            >
                                <span className={timeCol}>
                                    <Flag size={14} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-foreground">
                                        Deadline
                                    </span>
                                    <span className="block truncate text-[var(--color-text-secondary)]">
                                        {a.title} · {a.company}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
