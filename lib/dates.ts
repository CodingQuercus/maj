// Dates in Maj are calendar dates ("2026-05-12"), stored either as dates or as
// midnight-UTC timestamps ("2026-05-12T00:00:00+00:00"). They are handled as
// YYYY-MM-DD keys so they never shift a day across time zones.

// A Date (local) as a YYYY-MM-DD key.
export function toDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

// Today's date as YYYY-MM-DD in the user's local time zone.
// (toISOString() uses UTC, which gives yesterday's date shortly after midnight in Sweden.)
export function todayLocal(): string {
    return toDateKey(new Date());
}

// The YYYY-MM-DD part of a stored date or timestamp. Use for grouping and comparing.
export function dateKey(value: string): string {
    return value.slice(0, 10);
}

// A YYYY-MM-DD key (or stored timestamp) as a Date at local midnight.
// new Date("2026-05-12") would be UTC midnight, i.e. the previous day west of UTC.
export function parseDateKey(value: string): Date {
    const [y, m, d] = dateKey(value).split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Display format used everywhere in the UI: ISO "2026-11-14". Easy to scan in a column,
// sorts naturally, and reads the same in any language.
export function formatDate(value: string): string {
    return dateKey(value);
}


// Whole days from today to the given date (negative when it has passed).
export function daysUntil(value: string): number {
    const today = parseDateKey(todayLocal());
    return Math.round(
        (parseDateKey(value).getTime() - today.getTime()) / 86_400_000
    );
}
