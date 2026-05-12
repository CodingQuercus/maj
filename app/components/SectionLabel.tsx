import { ReactNode } from 'react';

type SectionLabelProps = {
    icon: ReactNode;
    label: string;
};

// Reusable section label.
// Used to introduce sections in detail views.
export default function SectionLabel({ icon, label }: SectionLabelProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
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
