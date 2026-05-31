'use client';

import { useState, useRef, useEffect } from 'react';
import { Status } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<Status>(currentStatus);
    const ref = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const router = useRouter();

    // Close popover when clicking outside.
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (newStatus: Status) => {
        // Update UI optimistically before database confirms.
        const previous = status;
        setStatus(newStatus);
        setOpen(false);
        const { error } = await supabase
            .from('job_applications')
            .update({ status: newStatus })
            .eq('id', applicationId);

        if (error) {
            setStatus(previous)
        } else {
            router.refresh()
        }
    };

    return (
        <div
            ref={ref}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            {/* Trigger badge, stopPropagation to prevent navigation on row click  */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                }}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Change status, current: ${status}`}
                className={`badge badge-dot badge-${status}`}
                style={{ cursor: 'pointer' }}
            >
                {statusLabels[status]}
            </button>

            {/* Status options popover */}
            {open && (
                <div
                    role="listbox"
                    aria-label="Select status"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        background: 'var(--color-white)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 100,
                        padding: 'var(--space-1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                        minWidth: '140px',
                    }}
                >
                    {statusOptions.map((s) => (
                        <button
                            key={s}
                            role="option"
                            aria-selected={status === s}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(s);
                            }}
                            className={`badge badge-dot badge-${s}`}
                            style={{
                                cursor: 'pointer',
                                opacity: status === s ? 1 : 0.5,
                                border:
                                    status === s
                                        ? '2px solid currentColor'
                                        : '1px solid',
                                textAlign: 'left',
                                justifyContent: 'flex-start',
                            }}
                        >
                            {statusLabels[s]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
