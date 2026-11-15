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
    applied: number;
};

// What the drawer is open for: a new event (on a date) or an existing one.
type DrawerState =
    | { open: false }
    | { open: true; date: string; event?: undefined }
    | { open: true; event: CalendarEvent; date?: undefined };

const emptyDay = (): Day => ({ events: [], deadlines: [], applied: 0 });

// How many items a grid cell shows before "+N more".
const CELL_LIMIT = 3;

// Month view of events (interviews, calls…), deadlines of open applications and the days
// you applied. A grid from md up, an agenda list of the days with something on phones.
// Events are added, edited and deleted here in a drawer, or on an application's page.
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
    // Day picked in the phone grid. Falls back to today in the current month.
    const [selected, setSelected] = useState<string | null>(null);

    const setMonth = (next: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next === thisMonth) params.delete('month');
        else params.set('month', next);
        const query = params.toString();
        window.history.replaceState(null, '', query ? `?${query}` : '?');
    };

    const addOn = (date: string) => setDrawer({ open: true, date });
    const edit = (event: CalendarEvent) => setDrawer({ open: true, event });

    // Everything by date. Built for all dates; the grid only reads the visible weeks.
    const days = new Map<string, Day>();
    const dayFor = (key: string) => {
        if (!days.has(key)) days.set(key, emptyDay());
        return days.get(key)!;
    };
    for (const event of [...events].sort(compareEvents)) {
        dayFor(event.event_date).events.push(event);
    }
    for (const app of applications) {
        if (app.deadline && OPEN_STATUSES.includes(app.status)) {
            dayFor(dateKey(app.deadline)).deadlines.push(app);
        }
        if (app.applied_at) dayFor(dateKey(app.applied_at)).applied += 1;
    }

    // Picker in the drawer: most recently applied first.
    const options = [...applications].sort((a, b) =>
        (b.applied_at ?? '').localeCompare(a.applied_at ?? '')
    );

    const weeks = monthWeeks(month);
    const label = formatMonth(month);
    const selectedDay = selected?.startsWith(month)
        ? selected
        : month === thisMonth
          ? today
          : null;

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-4 flex items-center justify-between sm:mb-8">
                <PageTitle icon={<CalendarDays />} title="Calendar" noMargin />
                <Button
                    // Today in the current month, otherwise the 1st of the month shown.
                    onClick={() =>
                        addOn(month === thisMonth ? today : `${month}-01`)
                    }
                    aria-label="Add event"
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

                {/* md and up: month grid */}
                <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-xs)] md:block">
                    <table className="w-full table-fixed border-collapse">
                        <caption className="sr-only">{label}</caption>
                        <thead>
                            <tr>
                                {WEEKDAYS.map((d) => (
                                    <th
                                        key={d}
                                        scope="col"
                                        className="border-b border-border px-2 py-2 text-left text-xs font-normal tracking-wider text-[var(--color-text-tertiary)] uppercase"
                                    >
                                        {d}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weeks.map((week) => (
                                <tr key={week[0]}>
                                    {week.map((key) => (
                                        <GridCell
                                            key={key}
                                            dayKey={key}
                                            day={days.get(key)}
                                            outside={!key.startsWith(month)}
                                            isToday={key === today}
                                            onAdd={addOn}
                                            onEdit={edit}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Phones: a compact month grid; tap a date to see it and add events. */}
                <MobileMonth
                    weeks={weeks}
                    month={month}
                    label={label}
                    today={today}
                    days={days}
                    selected={selectedDay}
                    onSelect={setSelected}
                    onAdd={addOn}
                    onEdit={edit}
                />

                <p className="text-xs text-[var(--color-text-tertiary)]">
                    Deadlines show for applications that are still open.
                </p>
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

function GridCell({
    dayKey,
    day,
    outside,
    isToday,
    onAdd,
    onEdit,
}: {
    dayKey: string;
    day: Day | undefined;
    outside: boolean;
    isToday: boolean;
    onAdd: (date: string) => void;
    onEdit: (event: CalendarEvent) => void;
}) {
    const dayNumber = Number(dayKey.slice(8));
    return (
        <td
            // A click on the day's empty space adds an event there (the + button is the
            // keyboard way to do the same).
            onClick={(e) => {
                if (outside || (e.target as HTMLElement).closest('a, button'))
                    return;
                onAdd(dayKey);
            }}
            className={cn(
                'group h-28 border-r border-b border-[var(--color-border-soft)] p-1.5 align-top last:border-r-0 [tr:last-child>&]:border-b-0',
                outside
                    ? 'bg-[var(--color-surface)]'
                    : 'cursor-pointer transition-colors hover:bg-[var(--color-surface)]'
            )}
        >
            <div className="mb-1 flex items-center justify-between">
                <span
                    className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
                        isToday
                            ? 'bg-primary font-semibold text-primary-foreground'
                            : outside
                              ? 'text-[var(--color-text-disabled)]'
                              : 'text-[var(--color-text-secondary)]'
                    )}
                    {...(isToday && { 'aria-current': 'date' as const })}
                >
                    <span className="sr-only">{dayKey}</span>
                    <span aria-hidden="true">{dayNumber}</span>
                </span>
                {/* Shown on hover or keyboard focus (always on touch screens). */}
                {!outside && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Add event on ${dayKey}`}
                        onClick={() => onAdd(dayKey)}
                        className="size-6 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                        <Plus size={14} aria-hidden="true" />
                    </Button>
                )}
            </div>
            {day && !outside && (
                <DayItems
                    dayKey={dayKey}
                    day={day}
                    limit={CELL_LIMIT}
                    onEdit={onEdit}
                />
            )}
        </td>
    );
}

// Events (with time), deadlines and an "N applied" line for one day. Events open in the
// drawer; deadlines go to their application. In the grid items are compact and capped at
// `limit`; in the agenda they get more room.
function DayItems({
    dayKey,
    day,
    limit,
    roomy = false,
    onEdit,
}: {
    dayKey: string;
    day: Day;
    limit?: number;
    roomy?: boolean;
    onEdit: (event: CalendarEvent) => void;
}) {
    const size = roomy ? 'px-3 py-2 text-sm' : 'px-1.5 py-0.5 text-xs';
    const items = [
        ...day.events.map((e) => (
            <button
                key={`e-${e.id}`}
                type="button"
                onClick={() => onEdit(e)}
                title={`${EVENT_KIND_LABELS[e.kind]}: ${e.job_applications.title} at ${e.job_applications.company}${e.note ? ` (${e.note})` : ''}`}
                className={cn(
                    'flex w-full cursor-pointer items-center gap-1 rounded-md bg-[var(--color-accent-subtle)] text-left text-[var(--color-accent-text)] transition-colors outline-none hover:bg-[var(--color-accent-border)] focus-ring',
                    size
                )}
            >
                <span className="truncate">
                    <span className="font-medium tabular-nums">
                        {formatTime(e.start_time) &&
                            `${formatTime(e.start_time)} `}
                        {EVENT_KIND_LABELS[e.kind]}
                    </span>{' '}
                    {e.job_applications.company}
                </span>
            </button>
        )),
        ...day.deadlines.map((a) => (
            <Link
                key={`d-${a.id}`}
                href={`/applications/${a.id}`}
                title={`Deadline: ${a.title} at ${a.company}`}
                className={cn(
                    'flex items-center gap-1 rounded-md border border-border text-[var(--color-text-secondary)] no-underline transition-colors hover:bg-accent hover:text-[var(--color-text-secondary)]',
                    size
                )}
            >
                <Flag
                    size={roomy ? 14 : 12}
                    aria-hidden="true"
                    className="shrink-0"
                />
                <span className="truncate">
                    <span className="font-medium">Deadline</span> {a.company}
                </span>
            </Link>
        )),
    ];
    const shown = limit ? items.slice(0, limit) : items;
    const hidden = items.length - shown.length;

    return (
        <ul className={cn('flex flex-col', roomy ? 'gap-1.5' : 'gap-0.5')}>
            {shown.map((item) => (
                <li key={item.key}>{item}</li>
            ))}
            {hidden > 0 && (
                <li className="px-1.5 text-xs text-[var(--color-text-tertiary)]">
                    +{hidden} more
                </li>
            )}
            {day.applied > 0 && (
                <li>
                    <Link
                        href={`/applications?from=${dayKey}&to=${dayKey}`}
                        className={cn(
                            'block text-[var(--color-text-tertiary)] no-underline hover:underline',
                            roomy ? 'px-3 text-sm' : 'px-1.5 text-xs'
                        )}
                    >
                        {day.applied} applied
                    </Link>
                </li>
            )}
        </ul>
    );
}

// Phones: 7-column grid of dates with dots for what is on them: filled for an event, a ring
// for a deadline (shape, not only colour, tells them apart), light for applied.
// Tapping a date shows its items below with a button to add an event on it.
function MobileMonth({
    weeks,
    month,
    label,
    today,
    days,
    selected,
    onSelect,
    onAdd,
    onEdit,
}: {
    weeks: string[][];
    month: string;
    label: string;
    today: string;
    days: Map<string, Day>;
    selected: string | null;
    onSelect: (day: string) => void;
    onAdd: (date: string) => void;
    onEdit: (event: CalendarEvent) => void;
}) {
    const day = selected ? days.get(selected) : undefined;
    const empty =
        !day ||
        (day.events.length === 0 &&
            day.deadlines.length === 0 &&
            day.applied === 0);

    // Read out with each date, e.g. "1 event, 1 deadline".
    const summary = (d: Day | undefined) =>
        [
            d?.events.length &&
                `${d.events.length} event${d.events.length === 1 ? '' : 's'}`,
            d?.deadlines.length &&
                `${d.deadlines.length} deadline${d.deadlines.length === 1 ? '' : 's'}`,
            d?.applied && `${d.applied} applied`,
        ]
            .filter(Boolean)
            .join(', ');

    return (
        <div className="flex flex-col gap-4 md:hidden">
            <div className="rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-xs)]">
                <div
                    aria-hidden="true"
                    className="grid grid-cols-7 pb-1 text-center text-[11px] tracking-wider text-[var(--color-text-tertiary)] uppercase"
                >
                    {WEEKDAYS.map((d) => (
                        <span key={d}>{d.slice(0, 2)}</span>
                    ))}
                </div>
                <div
                    role="group"
                    aria-label={label}
                    className="grid grid-cols-7"
                >
                    {weeks.flat().map((key) => {
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
                                className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg outline-none focus-ring"
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
                                    {d && d.applied > 0 && (
                                        <span className="size-1.5 rounded-full bg-[var(--color-accent-border)]" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <p
                    aria-hidden="true"
                    className="flex justify-center gap-4 pt-2 text-[11px] text-[var(--color-text-tertiary)]"
                >
                    <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Event
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full border border-[var(--color-text-tertiary)]" />
                        Deadline
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-[var(--color-accent-border)]" />
                        Applied
                    </span>
                </p>
            </div>

            {selected ? (
                <section aria-label={formatAgendaDay(selected)}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3
                            className={cn(
                                'text-sm font-medium tabular-nums',
                                selected === today
                                    ? 'text-primary'
                                    : 'text-[var(--color-text-secondary)]'
                            )}
                        >
                            {formatAgendaDay(selected)}
                            {selected === today && ' · Today'}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAdd(selected)}
                        >
                            <Plus size={14} aria-hidden="true" />
                            Add event
                        </Button>
                    </div>
                    {empty ? (
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                            Nothing on this day.
                        </p>
                    ) : (
                        <DayItems
                            dayKey={selected}
                            day={day!}
                            onEdit={onEdit}
                            roomy
                        />
                    )}
                </section>
            ) : (
                <p className="text-center text-sm text-[var(--color-text-tertiary)]">
                    Tap a date to see it or add an event.
                </p>
            )}
        </div>
    );
}
