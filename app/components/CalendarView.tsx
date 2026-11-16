'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
} from 'lucide-react';

import EventDrawer from './EventDrawer';
import MonthSelect from './MonthSelect';
import PageTitle from './PageTitle';
import { Button } from '@/components/ui/button';
import {
    WEEKDAYS,
    formatDayLong,
    formatDayShort,
    monthWeeks,
    nextDays,
    relativeDay,
} from '@/lib/calendar';
import { dateKey, todayLocal } from '@/lib/dates';
import {
    EVENT_KIND_LABELS,
    EVENT_KIND_TONE,
    compareEvents,
    formatTime,
} from '@/lib/events';
import {
    currentMonth,
    formatMonth,
    isMonthKey,
    shiftMonth,
} from '@/lib/months';
import { STATUS_COLORS } from '@/lib/status';
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

// How many days the side panel looks ahead when no day is picked.
const UPCOMING_DAYS = 7;

// The dot colours in use (calls and other events share one) with what they stand for.
const LEGEND = [
    { tone: EVENT_KIND_TONE.interview, label: 'Interview' },
    { tone: EVENT_KIND_TONE.assessment, label: 'Assessment' },
    { tone: EVENT_KIND_TONE.call, label: 'Call or other' },
];

const hasItems = (d: Day | undefined): d is Day =>
    !!d && d.events.length + d.deadlines.length > 0;

// Two columns: a month calendar, and beside it what is coming up in the next seven days
// (events by time, and last days to apply for saved jobs). Picking a date narrows the list
// to that day; picking it again goes back. Stacked on phones. Events are added, edited and
// deleted in a drawer, or on an application's page. The month lives in the URL (?month=2026-11).
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
        // Last day to apply, for jobs saved but not applied for yet.
        if (app.deadline && app.status === 'saved') {
            dayFor(dateKey(app.deadline)).deadlines.push(app);
        }
    }

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
        // On larger screens the two cards fill the window's height, side by side.
        <div className="flex min-h-dvh flex-col p-4 sm:p-8">
            <PageTitle icon={<CalendarDays />} title="Calendar" />
            <hr />

            <div className="grid grid-cols-1 gap-4 md:min-h-[560px] md:flex-1 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <MonthGrid
                    month={month}
                    onMonth={setMonth}
                    today={today}
                    days={days}
                    picked={picked}
                    onPick={(key) =>
                        setPicked((current) => (current === key ? null : key))
                    }
                />
                <Agenda
                    picked={picked}
                    today={today}
                    days={days}
                    onShowUpcoming={() => setPicked(null)}
                    onAdd={(date) => setDrawer({ open: true, date })}
                    onEdit={(event) => setDrawer({ open: true, event })}
                />
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

// Dates of the month marked with a dot per colour of event (with the number of events when
// there are several) and a flag for a last day to apply, so shape tells them apart and
// not only colour. A legend below says what the colours are.
function MonthGrid({
    month,
    onMonth,
    today,
    days,
    picked,
    onPick,
}: {
    month: string;
    onMonth: (month: string) => void;
    today: string;
    days: Map<string, Day>;
    picked: string | null;
    onPick: (day: string) => void;
}) {
    // Events and deadlines per month, for the month picker.
    const monthCounts = new Map<string, number>();
    for (const [key, d] of days) {
        const m = key.slice(0, 7);
        monthCounts.set(
            m,
            (monthCounts.get(m) ?? 0) + d.events.length + d.deadlines.length
        );
    }

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
        <div className="flex flex-col rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-xs)] sm:p-3">
            {/* Previous / month / next. The month opens a year of months to jump to, each
                with how many events and deadlines it has. */}
            <div className="flex items-center justify-between gap-2 px-1 pt-1 pb-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous month"
                    onClick={() => onMonth(shiftMonth(month, -1))}
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                </Button>
                <h2 aria-live="polite">
                    <MonthSelect
                        month={month}
                        onChange={onMonth}
                        counts={monthCounts}
                        noun={['event or deadline', 'events or deadlines']}
                    />
                </h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next month"
                    onClick={() => onMonth(shiftMonth(month, 1))}
                >
                    <ChevronRight size={16} aria-hidden="true" />
                </Button>
            </div>
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
                className="grid grid-cols-7 md:flex-1 md:auto-rows-fr"
            >
                {monthWeeks(month)
                    .flat()
                    .map((key) => {
                        if (!key.startsWith(month))
                            return <span key={key} aria-hidden="true" />;
                        const d = days.get(key);
                        const isPicked = key === picked;
                        const isToday = key === today;
                        const info = summary(d);
                        const tones = [
                            ...new Set(
                                d?.events.map((e) => EVENT_KIND_TONE[e.kind])
                            ),
                        ];
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={isPicked}
                                aria-label={`${formatDayLong(key)}${isToday ? ', today' : ''}${info ? `, ${info}` : ''}`}
                                onClick={() => onPick(key)}
                                className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg outline-none hover:bg-[var(--color-surface)] focus-ring sm:h-14 md:h-auto md:min-h-14"
                            >
                                <span
                                    className={cn(
                                        'inline-flex size-8 items-center justify-center rounded-full text-sm tabular-nums',
                                        isPicked
                                            ? 'bg-primary font-semibold text-primary-foreground'
                                            : 'text-foreground',
                                        // Today is always ringed, picked or not.
                                        isToday &&
                                            'font-semibold ring-2 ring-primary ring-offset-2 ring-offset-[var(--color-card)]'
                                    )}
                                >
                                    {Number(key.slice(8))}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="flex h-2.5 items-center gap-0.5 text-[var(--color-text-secondary)]"
                                >
                                    {tones.map((tone) => (
                                        <span
                                            key={tone}
                                            className="size-1.5 rounded-full"
                                            style={{
                                                background: STATUS_COLORS[tone],
                                            }}
                                        />
                                    ))}
                                    {d && d.events.length > 1 && (
                                        <span className="text-[10px] leading-none font-medium tabular-nums">
                                            {d.events.length}
                                        </span>
                                    )}
                                    {d && d.deadlines.length > 0 && (
                                        <Flag
                                            size={10}
                                            strokeWidth={2.5}
                                            className={cn(
                                                tones.length && 'ml-0.5'
                                            )}
                                        />
                                    )}
                                </span>
                            </button>
                        );
                    })}
            </div>
            {/* What the marks mean. Kinds also show as labelled badges in the list. */}
            <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-1 pt-3 pb-1 text-xs text-[var(--color-text-secondary)]">
                {LEGEND.map(({ tone, label }) => (
                    <li key={label} className="flex items-center gap-1.5">
                        <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full"
                            style={{ background: STATUS_COLORS[tone] }}
                        />
                        {label}
                    </li>
                ))}
                <li className="flex items-center gap-1.5">
                    <Flag size={12} strokeWidth={2.25} aria-hidden="true" />
                    Last day to apply
                </li>
            </ul>
        </div>
    );
}

// The next seven days, grouped by day, or only the picked day. Events open for editing;
// deadlines go to their application.
function Agenda({
    picked,
    today,
    days,
    onShowUpcoming,
    onAdd,
    onEdit,
}: {
    picked: string | null;
    today: string;
    days: Map<string, Day>;
    onShowUpcoming: () => void;
    onAdd: (date: string) => void;
    onEdit: (event: CalendarEvent) => void;
}) {
    const shown = picked
        ? [picked]
        : nextDays(today, UPCOMING_DAYS).filter((key) =>
              hasItems(days.get(key))
          );
    const addDate = picked ?? today;

    // "Today", "Tomorrow" or nothing, after a date.
    const nearby = (key: string) => {
        const rel = relativeDay(key, today);
        return rel === 'today' || rel === 'tomorrow'
            ? rel[0].toUpperCase() + rel.slice(1)
            : '';
    };

    return (
        <section
            aria-labelledby="agenda-heading"
            className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-xs)]"
        >
            {picked && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-mt-1 mb-1 -ml-2 self-start text-[var(--color-text-secondary)]"
                    onClick={onShowUpcoming}
                >
                    <ChevronLeft size={14} aria-hidden="true" />
                    Next {UPCOMING_DAYS} days
                </Button>
            )}
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3
                    id="agenda-heading"
                    aria-live="polite"
                    className={cn(
                        'text-[length:var(--text-md)]',
                        picked === today && 'text-primary'
                    )}
                >
                    {picked ? (
                        <>
                            {formatDayShort(picked)}
                            {nearby(picked) && ` · ${nearby(picked)}`}
                        </>
                    ) : (
                        `Next ${UPCOMING_DAYS} days`
                    )}
                </h3>
                {/* Adds on the picked day, or today. */}
                <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Add event on ${formatDayLong(addDate)}`}
                    onClick={() => onAdd(addDate)}
                >
                    <Plus size={14} aria-hidden="true" />
                    Add event
                </Button>
            </div>

            {shown.length === 0 || (picked && !hasItems(days.get(picked))) ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    {picked
                        ? 'Nothing planned.'
                        : `Nothing in the next ${UPCOMING_DAYS} days.`}
                </p>
            ) : (
                // Scrolls on its own on larger screens, so the card keeps the calendar's height.
                <div className="-m-1 p-1 md:min-h-0 md:flex-1 md:overflow-y-auto">
                    {picked ? (
                        <DayItems
                            day={days.get(picked)!}
                            today={today}
                            onEdit={onEdit}
                        />
                    ) : (
                        <ul className="flex flex-col gap-4">
                            {shown.map((key) => (
                                <li key={key}>
                                    <h4
                                        className={cn(
                                            'mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]',
                                            key === today && 'text-primary'
                                        )}
                                    >
                                        {nearby(key) && `${nearby(key)} · `}
                                        {formatDayShort(key)}
                                    </h4>
                                    <DayItems
                                        day={days.get(key)!}
                                        today={today}
                                        onEdit={onEdit}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

// One day's events in time order (those without a time first), then its deadlines. The
// company comes first and wraps rather than being cut off.
function DayItems({
    day,
    today,
    onEdit,
}: {
    day: Day;
    today: string;
    onEdit: (event: CalendarEvent) => void;
}) {
    const row =
        'flex w-full flex-col items-start gap-1 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent';

    return (
        <ul className="flex flex-col gap-1.5">
            {day.events.map((e) => (
                <li key={e.id}>
                    <button
                        type="button"
                        onClick={() => onEdit(e)}
                        className={cn(
                            row,
                            'cursor-pointer outline-none focus-ring'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {e.start_time && (
                                <span className="font-medium text-foreground tabular-nums">
                                    {formatTime(e.start_time)}
                                </span>
                            )}
                            <span
                                className={`badge badge-dot badge-${EVENT_KIND_TONE[e.kind]}`}
                            >
                                {EVENT_KIND_LABELS[e.kind]}
                            </span>
                        </span>
                        <Names
                            company={e.job_applications.company}
                            title={e.job_applications.title}
                        />
                        {e.note && (
                            <span className="block max-w-full truncate text-xs text-[var(--color-text-tertiary)]">
                                {e.note}
                            </span>
                        )}
                    </button>
                </li>
            ))}
            {day.deadlines.map((a) => (
                <li key={a.id}>
                    <Link
                        href={`/applications/${a.id}`}
                        className={cn(row, 'no-underline')}
                    >
                        <span className="flex items-center gap-2">
                            <span className="badge badge-saved">
                                <Flag size={12} aria-hidden="true" />
                                Apply by
                            </span>
                            {/* Time left to apply. */}
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {relativeDay(dateKey(a.deadline!), today)}
                            </span>
                        </span>
                        <Names company={a.company} title={a.title} />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function Names({ company, title }: { company: string; title: string }) {
    return (
        <>
            <span className="block max-w-full font-medium break-words text-foreground">
                {company}
            </span>
            <span className="-mt-1 block max-w-full break-words text-[var(--color-text-secondary)]">
                {title}
            </span>
        </>
    );
}
