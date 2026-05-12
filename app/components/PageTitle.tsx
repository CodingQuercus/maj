import { ReactNode } from 'react';

type PageTitleProps = {
    icon: ReactNode;
    title: string;
    noMargin?: boolean; // set to true when parent controls spacing.
};

// Reusable page title component.
export default function PageTitle({
    icon,
    title,
    noMargin = false,
}: PageTitleProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: noMargin ? 0 : 'var(--space-8)',
            }}
        >
            <span
                aria-hidden="true"
                style={{ color: 'var(--color-text-primary)' }}
            >
                {icon}
            </span>
            <h1>{title}</h1>
        </div>
    );
}
