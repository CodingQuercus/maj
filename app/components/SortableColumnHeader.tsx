import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortableColumnHeaderProps = {
    label: string;
    sortKey: string;
    currentSortKey: string;
    sortDir: 'asc' | 'desc';
    onSort: (key: string) => void;
};

// Reusable sortable column header for table view.
// Shows active sort direction with icons, and a neutral icon for inactive columns.
export default function SortableColumnHeader({
    label,
    sortKey,
    currentSortKey,
    sortDir,
    onSort,
}: SortableColumnHeaderProps) {
    const active = sortKey === currentSortKey;

    return (
        <button
            onClick={() => onSort(sortKey)}
            aria-label={`Sort by ${label}`}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                fontWeight: '500',
                color: active
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: 0,
            }}
        >
            {label}
            {/* Show direction arrow if active, neutral icon if not */}
            {active ? (
                sortDir === 'asc' ? (
                    <ChevronUp size={12} />
                ) : (
                    <ChevronDown size={12} />
                )
            ) : (
                <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />
            )}
        </button>
    );
}
