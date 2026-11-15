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
            className={`flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs font-medium tracking-[0.08em] uppercase ${
                active ? 'text-foreground' : 'text-[var(--color-text-tertiary)]'
            }`}
        >
            {label}
            {/* Show direction arrow if active, neutral icon if not */}
            {active ? (
                sortDir === 'asc' ? (
                    <ChevronUp size={12} aria-hidden="true" />
                ) : (
                    <ChevronDown size={12} aria-hidden="true" />
                )
            ) : (
                <ChevronsUpDown size={12} className="opacity-30" />
            )}
        </button>
    );
}
