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
            <h6>{label}</h6>
        </div>
    );
}
