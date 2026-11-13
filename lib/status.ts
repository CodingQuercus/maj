import { Status, WorkType } from './types';

// Application statuses in pipeline order. Single source for menus, filters and charts.
export const STATUSES: Status[] = [
    'applied',
    'assessment',
    'interview',
    'offer',
    'rejected',
    'withdrawn',
];

export const STATUS_LABELS: Record<Status, string> = {
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

// Hex values for charts (SVG attributes can't use CSS variables).
// Keep in sync with the --status-* tokens in globals.css.
export const STATUS_COLORS: Record<Status, string> = {
    applied: '#64748b',
    assessment: '#0284c7',
    interview: '#d97706',
    offer: '#16a34a',
    rejected: '#dc2626',
    withdrawn: '#7c3aed',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
    'on-site': 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
};

// Narrows untrusted input (e.g. URL query params) to a Status.
export function isStatus(value: string): value is Status {
    return (STATUSES as string[]).includes(value);
}
