'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

import PageTitle from './PageTitle';
import { Button } from '@/components/ui/button';
import { WEEKDAYS, formatAgendaDay, monthWeeks } from '@/lib/calendar';
import { dateKey, todayLocal } from '@/lib/dates';
import { EVENT_KIND_LABELS, compareEvents, formatTime } from '@/lib/events';
import {
    currentMonth,
    formatMonth,
    isMonthKey,
    shiftMonth,
} from '@/lib/report';
import { OPEN_STATUSES } from '@/lib/status';
import { ApplicationEvent, JobApplication } from '@/lib/types';
import { cn } from '@/lib/utils';

// An event with the application it belongs to (embedded by the page's query).
export type CalendarEvent = ApplicationEvent & {
    job_applications: Pick<JobApplication, 'id' | 'title' | 'company'>;
};

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

const emptyDay = (): Day => ({ events: [], deadlines: [], applied: 0 });

// How many items a grid cell shows before "+N more".
const CELL_LIMIT = 3;

// Month view of events (interviews, calls…), deadlines of open applications and the days
// you applied. A grid from md up, an agenda list of the days with something on phones.
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

    const setMonth = (next: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next === thisMonth) params.delete('month');
        else params.set('month', next);
        const query = params.toString();
        window.history.replaceState(null, '', query ? `?${query}` : '?');
    };

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

    const weeks = monthWeeks(month);
    const label = formatMonth(month);
    const monthDays = [...days.keys()]
        .filter((key) => key.startsWith(month))
        .sort();

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<CalendarDays />} title="Calendar" />
            <hr />

            <div className="flex flex-col gap-4">
                {/* Month picker */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Previous month"
                        onClick={() => setMonth(shiftMonth(month, -1))}
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </Button>
                    <h2
                        className="min-w-40 text-center text-[length:var(--text-md)] tabular-nums"
                        aria-live="polite"
                    >
                        {label}
                    </h2>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Next month"
                        onClick={() => setMonth(shiftMonth(month, 1))}
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </Button>
                    {month !== thisMonth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMonth(thisMonth)}
                        >
                            Today
                        </Button>
                    )}
                </div>

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
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Phones: agenda of the days that have something */}
                <div className="md:hidden">
                    {monthDays.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                            Nothing in {label}.
                        </p>
                    ) : (
                        <ol className="flex flex-col gap-4">
                            {monthDays.map((key) => (
                                <li key={key}>
                                    <h3
                                        className={cn(
                                            'mb-1.5 text-sm font-medium tabular-nums',
                                            key === today
                                                ? 'text-primary'
                                                : 'text-[var(--color-text-secondary)]'
                                        )}
                                    >
                                        {formatAgendaDay(key)}
                                        {key === today && ' · Today'}
                                    </h3>
                                    <DayItems
                                        dayKey={key}
                                        day={days.get(key)!}
                                        roomy
                                    />
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <p className="text-xs text-[var(--color-text-tertiary)]">
                    Add interviews and other events on an application’s page.
                    Deadlines show for applications that are still open.
                </p>
            </div>
        </div>
    );
}

function GridCell({
    dayKey,
    day,
    outside,
    isToday,
}: {
    dayKey: string;
    day: Day | undefined;
    outside: boolean;
    isToday: boolean;
}) {
    const dayNumber = Number(dayKey.slice(8));
    return (
        <td
            className={cn(
                'h-28 border-r border-b border-[var(--color-border-soft)] p-1.5 align-top last:border-r-0 [tr:last-child>&]:border-b-0',
                outside && 'bg-[var(--color-surface)]'
            )}
        >
            <span
                className={cn(
                    'mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
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
            {day && !outside && (
                <DayItems dayKey={dayKey} day={day} limit={CELL_LIMIT} />
            )}
        </td>
    );
}

// Events (with time), deadlines and an "N applied" line for one day. In the grid they are
// compact and capped at `limit`; in the agenda they get more room.
function DayItems({
    dayKey,
    day,
    limit,
    roomy = false,
}: {
    dayKey: string;
    day: Day;
    limit?: number;
    roomy?: boolean;
}) {
    const items = [
        ...day.events.map((e) => ({
            id: `e-${e.id}`,
            href: `/applications/${e.job_applications.id}`,
            label: `${formatTime(e.start_time) ? `${formatTime(e.start_time)} ` : ''}${EVENT_KIND_LABELS[e.kind]}`,
            detail: e.job_applications.company,
            title: `${EVENT_KIND_LABELS[e.kind]}: ${e.job_applications.title} at ${e.job_applications.company}${e.note ? ` (${e.note})` : ''}`,
            deadline: false,
        })),
        ...day.deadlines.map((a) => ({
            id: `d-${a.id}`,
            href: `/applications/${a.id}`,
            label: 'Deadline',
            detail: a.company,
            title: `Deadline: ${a.title} at ${a.company}`,
            deadline: true,
        })),
    ];
    const shown = limit ? items.slice(0, limit) : items;
    const hidden = items.length - shown.length;

    return (
        <ul className={cn('flex flex-col', roomy ? 'gap-1.5' : 'gap-0.5')}>
            {shown.map((item) => (
                <li key={item.id}>
                    <Link
                        href={item.href}
                        title={item.title}
                        className={cn(
                            'flex items-center gap-1 rounded-md no-underline transition-colors',
                            roomy
                                ? 'px-3 py-2 text-sm'
                                : 'px-1.5 py-0.5 text-xs',
                            item.deadline
                                ? 'border border-border text-[var(--color-text-secondary)] hover:bg-accent hover:text-[var(--color-text-secondary)]'
                                : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-border)] hover:text-[var(--color-accent-text)]'
                        )}
                    >
                        {item.deadline && (
                            <Flag
                                size={roomy ? 14 : 12}
                                aria-hidden="true"
                                className="shrink-0"
                            />
                        )}
                        <span className="truncate">
                            <span className="font-medium tabular-nums">
                                {item.label}
                            </span>{' '}
                            {item.detail}
                        </span>
                    </Link>
                </li>
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
