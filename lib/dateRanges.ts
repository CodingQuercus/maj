import { parseDateKey, toDateKey, todayLocal } from './dates';

export type DateRangePreset = {
    id: string;
    label: string;
    from: string;
    to: string;
};

// Quick choices for filtering on date applied, all as YYYY-MM-DD ranges ending today
// or covering a whole calendar period.
export function dateRangePresets(): DateRangePreset[] {
    const today = parseDateKey(todayLocal());
    const y = today.getFullYear();
    const m = today.getMonth();
    const key = toDateKey;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday

    const daysAgo = (n: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return d;
    };

    return [
        {
            id: 'this-week',
            label: 'This week',
            from: key(weekStart),
            to: key(today),
        },
        {
            id: 'last-30',
            label: 'Last 30 days',
            from: key(daysAgo(29)),
            to: key(today),
        },
        {
            id: 'this-month',
            label: 'This month',
            from: key(new Date(y, m, 1)),
            to: key(today),
        },
        {
            id: 'last-month',
            label: 'Last month',
            from: key(new Date(y, m - 1, 1)),
            to: key(new Date(y, m, 0)),
        },
        {
            id: 'last-3-months',
            label: 'Last 3 months',
            from: key(new Date(y, m - 2, 1)),
            to: key(today),
        },
        {
            id: 'this-year',
            label: 'This year',
            from: key(new Date(y, 0, 1)),
            to: key(today),
        },
    ];
}

// Short label for a range: a preset's name when it matches one, otherwise the dates.
export function describeDateRange(
    from: string | null,
    to: string | null
): string {
    if (!from && !to) return 'Any date';
    const preset = dateRangePresets().find(
        (p) => p.from === from && p.to === to
    );
    if (preset) return preset.label;
    if (from && to) return from === to ? from : `${from} – ${to}`;
    return from ? `From ${from}` : `Until ${to}`;
}
