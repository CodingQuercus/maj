import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
    variable: '--font-sans',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
    title: {
        default: 'Maj',
        template: '%s | Maj',
    },
    description:
        'Track your job applications in one place. Stay organized, stay focused.',
    icons: {
        icon: [
            { url: '/icon.svg', type: 'image/svg+xml' },
            { url: '/icon.png', type: 'image/png' },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
