import { ReactNode } from 'react';

type SectionLabelProps = {
    icon: ReactNode;
    label: string;
    noMargin?: true
};

// Reusable section label.
// Used to introduce sections in detail views.
export default function SectionLabel({ icon, label, noMargin }: SectionLabelProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: noMargin ? 0 : 'var(--space-3)',
            }}
        >
            <span
                style={{ color: 'var(--color-text-tertiary)' }}
                aria-hidden="true"
            >
                {icon}
            </span>
            {/* An h2 (the page title is the h1), styled as a small uppercase label. */}
            <h2 className="text-sm font-medium tracking-[var(--tracking-widest)] text-[var(--color-text-tertiary)] uppercase">
                {label}
            </h2>
        </div>
    );
}
