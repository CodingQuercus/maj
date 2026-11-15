import { ReactNode } from 'react';

import { MobileMenuButton } from './MobileMenu';

type PageTitleProps = {
    icon: ReactNode;
    title: string;
    noMargin?: boolean; // set to true when parent controls spacing.
};

// Page title with icon. Sizes follow the breakpoint in CSS (24px icon on phones, 32px above).
export default function PageTitle({ icon, title, noMargin = false }: PageTitleProps) {
    return (
        <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-4 sm:mb-8'}`}>
            {/* Phones: the menu button takes the icon's place. */}
            <MobileMenuButton />
            <span aria-hidden="true" className="hidden text-foreground sm:inline [&_svg]:size-8">
                {icon}
            </span>
            <h1 className="text-xl sm:text-3xl">{title}</h1>
        </div>
    );
}
