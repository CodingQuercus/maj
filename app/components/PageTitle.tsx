"use client";

import { ReactNode } from 'react';

import { useBreakpoint } from '@/hooks/useBreakpoint';

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
    const bp = useBreakpoint();

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: noMargin ? 0 : bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
            }}
        >
            <span
                aria-hidden="true"
                style={{ color: 'var(--color-text-primary)' }}
            >
                {icon}
            </span>
            <h1
                style={{
                    fontSize: bp === 'mobile' ? 'var(--text-xl)' : 'var(--text-3xl)',
                }}
            >
                {title}
            </h1>
        </div>
    );
}
