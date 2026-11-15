import { toDateKey } from './dates';

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

// "Tue 2026-11-17", for agenda headings.
export function formatAgendaDay(key: string): string {
    const [y, m, d] = key.split('-').map(Number);
    const weekday = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
        weekday: 'short',
    });
    return `${weekday} ${key}`;
}
