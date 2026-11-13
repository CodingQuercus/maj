'use client';

import { useState } from 'react';
import { Status } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusOptions: Status[] = [
    'applied',
    'assessment',
    'interview',
    'offer',
    'rejected',
    'withdrawn',
];

const statusLabels: Record<Status, string> = {
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

type StatusPopoverProps = {
    applicationId: string;
    currentStatus: Status;
};

export default function StatusPopover({
    applicationId,
    currentStatus,
}: StatusPopoverProps) {
    const [status, setStatus] = useState<Status>(currentStatus);
    const supabase = createClient();
    const router = useRouter();

    const handleSelect = async (newStatus: Status) => {
        if (newStatus === status) return;
        // Update UI optimistically before database confirms.
        const previous = status;
        setStatus(newStatus);
        const { error } = await supabase
            .from('job_applications')
            .update({ status: newStatus })
            .eq('id', applicationId);

        if (error) {
            setStatus(previous);
            toast.error('Could not update status. Please try again.');
        } else {
            router.refresh();
        }
    };

    // The menu sits inside a clickable list row. React events bubble through the portal
    // to the row, so clicks and key presses here must not reach it (it would navigate).
    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    onClick={stop}
                    onKeyDown={stop}
                    aria-label={`Change status, current: ${statusLabels[status]}`}
                    className={`badge badge-dot badge-${status}`}
                    style={{ cursor: 'pointer' }}
                >
                    {statusLabels[status]}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={stop} onKeyDown={stop}>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={status}
                    onValueChange={(value) => handleSelect(value as Status)}
                >
                    {statusOptions.map((s) => (
                        <DropdownMenuRadioItem key={s} value={s}>
                            <span className={`badge badge-dot badge-${s}`}>
                                {statusLabels[s]}
                            </span>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
