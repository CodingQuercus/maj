import { parseDateKey, toDateKey, todayLocal } from './dates';

// Weeks of the month grid, Monday first: each week is 7 YYYY-MM-DD keys, starting on the
// Monday on or before the 1st and ending on the Sunday on or after the last day.
export function monthWeeks(month: string): string[][] {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    // Back to Monday, forward to Sunday (getDay: 0 = Sunday).
    const day = new Date(y, m - 1, 1 - ((first.getDay() + 6) % 7));
    const end = new Date(y, m - 1, last.getDate() + ((7 - last.getDay()) % 7));

    const weeks: string[][] = [];
    while (day <= end) {
        const week: string[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(toDateKey(day));
            day.setDate(day.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// `count` days from `start` (YYYY-MM-DD keys), e.g. the next seven days from today.
export function nextDays(start: string, count: number): string[] {
    const day = parseDateKey(start);
    return Array.from({ length: count }, (_, i) =>
        toDateKey(
            new Date(day.getFullYear(), day.getMonth(), day.getDate() + i)
        )
    );
}

// "Mon 16 Nov" for calendar headings, with the year when it isn't this year
// ("Tue 5 Jan 2027"). The calendar reads like a diary; lists elsewhere keep ISO dates.
export function formatDayShort(key: string): string {
    const date = parseDateKey(key);
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
    // en-US month names: "Sep", not en-GB's "Sept".
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year =
        key.slice(0, 4) === todayLocal().slice(0, 4)
            ? ''
            : ` ${key.slice(0, 4)}`;
    return `${weekday} ${date.getDate()} ${month}${year}`;
}

// "Monday 16 November 2026", for screen readers.
export function formatDayLong(key: string): string {
    return parseDateKey(key).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// How far a day is from today: "today", "tomorrow", "in 12 days", "yesterday", "3 days ago".
export function relativeDay(key: string, today: string): string {
    const days = Math.round(
        (parseDateKey(key).getTime() - parseDateKey(today).getTime()) /
            86_400_000
    );
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days === -1) return 'yesterday';
    return days > 0 ? `in ${days} days` : `${-days} days ago`;
}
