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
        <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-3'}`}>
            <span className="text-[var(--color-text-tertiary)]" aria-hidden="true">
                {icon}
            </span>
            {/* An h2 (the page title is the h1), styled as a small uppercase label. */}
            <h2 className="text-sm font-medium tracking-[var(--tracking-widest)] text-[var(--color-text-tertiary)] uppercase">
                {label}
            </h2>
        </div>
    );
}
