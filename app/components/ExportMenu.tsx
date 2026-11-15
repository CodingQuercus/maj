'use client';

import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    EXPORT_PERIOD_LABELS,
    type ExportPeriod,
    applicationsInPeriod,
    downloadCsv,
    exportFileName,
    toCsv,
} from '@/lib/export';
import { JobApplication } from '@/lib/types';

type ExportMenuProps = {
    applications: JobApplication[];
};

// Downloads applications as CSV, e.g. for a monthly activity report to the employment
// office. Exports every status in the period, regardless of the list's current filter.
export default function ExportMenu({ applications }: ExportMenuProps) {
    const exportPeriod = (period: ExportPeriod) => {
        const rows = applicationsInPeriod(applications, period);
        if (rows.length === 0) {
            toast.info(
                `No applications to export for ${EXPORT_PERIOD_LABELS[period].toLowerCase()}.`
            );
            return;
        }
        downloadCsv(toCsv(rows), exportFileName(period));
        toast.success(
            `Exported ${rows.length} application${rows.length === 1 ? '' : 's'}`
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Export applications"
                    className="sm:w-auto sm:px-4"
                >
                    <Download size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">Export</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuLabel>Export as CSV (Excel)</DropdownMenuLabel>
                {(Object.keys(EXPORT_PERIOD_LABELS) as ExportPeriod[]).map(
                    (period) => (
                        <DropdownMenuItem
                            key={period}
                            onSelect={() => exportPeriod(period)}
                        >
                            {EXPORT_PERIOD_LABELS[period]}
                        </DropdownMenuItem>
                    )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/report" className="no-underline">
                        <FileText size={16} aria-hidden="true" />
                        Monthly activity report
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
