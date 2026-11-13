// Returns today's date as YYYY-MM-DD in the user's local time zone.
// (toISOString() uses UTC, which gives yesterday's date shortly after midnight in Sweden.)
export function todayLocal(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

// Formats a date ("2026-05-12") or a midnight-UTC timestamp ("2026-05-12T00:00:00+00:00")
// from the database as YYYY-MM-DD. Parsing these with new Date() and formatting in local time
// shows the previous day for users west of UTC, so the date part is used as-is.
export function formatDate(value: string): string {
    return value.slice(0, 10);
}
