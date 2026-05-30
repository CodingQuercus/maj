'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { JobApplication, WorkType } from '@/lib/types';
import { BreakPoint } from '@/hooks/useBreakpoint';

import { X, ChevronsLeftRight } from 'lucide-react';
import ApplicationForm from './ApplicationForm';

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    application?: JobApplication;
    bp: BreakPoint;
};

type FormValues = {
    title: string;
    company: string;
    location: string;
    workType: WorkType;
    deadline: string;
    appliedAt: string;
    url: string;
    description: string;
    notes: string;
};

export default function ApplicationDrawer({
    open,
    onClose,
    application,
    bp
}: DrawerProps) {

    const [values, setValues] = useState<FormValues>({
        title: application?.title ?? '',
        company: application?.company ?? '',
        location: application?.location ?? '',
        workType: application?.work_type ?? 'hybrid',
        deadline: application?.deadline ?? '',
        appliedAt: application?.applied_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        url: application?.url ?? '',
        description: application?.description ?? '',
        notes: application?.notes ?? '',
    });


    const isEditing = !!application;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [drawerWidth, setDrawerWidth] = useState(480);
    const [handleHovered, setHandleHovered] = useState(false);
    const isDragging = useRef(false);

    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isEditing) {
            const { error } = await supabase
                .from('job_applications')
                .update({
                    title: values.title,
                    company: values.company,
                    location: values.location,
                    work_type: values.workType,
                    deadline: values.deadline || null,
                    applied_at: values.appliedAt
                        ? new Date(values.appliedAt).toISOString()
                        : null,
                    description: values.description || null,
                    notes: values.notes || null,
                    url: values.url || null,
                })
                .eq('id', application.id);

            if (error) {
                setError('Something went wrong. Please try again');
                setLoading(false);
                return
            }
            router.refresh();
            onClose();
        } else {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('job_applications').insert({
                title: values.title,
                company: values.company,
                location: values.location,
                work_type: values.workType,
                deadline: values.deadline || null,
                description: values.description || null,
                notes: values.notes || null,
                user_id: user.id,
                status: 'applied',
                applied_at: values.appliedAt
                    ? new Date(values.appliedAt).toISOString()
                    : new Date().toISOString(),
                url: values.url || null,
            });

            if (error) {
                setError('Something went wrong. Please try again');
                setLoading(false);
                return
            }
            router.refresh();
            onClose();
            resetForm();
        }

        setLoading(false);
    };

    const handleChange = (field: keyof FormValues, value: string) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setValues({
            title: '',
            company: '',
            location: '',
            workType: 'hybrid',
            deadline: '',
            appliedAt: new Date().toISOString().split('T')[0],
            url: '',
            description: '',
            notes: '',
        });
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    }

    useEffect(() => {

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const newWidth = window.innerWidth - e.clientX;
            setDrawerWidth(Math.min(Math.max(newWidth, 480), 700))
        }

        const handleMouseUp = () => {
            isDragging.current = false;
        }

        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        }

    }, []);

    return (
        <>
            {open && (
                <div
                    onClick={onClose}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.2)',
                        zIndex: 40,
                        transition: 'opacity var(--transition-base)',
                    }}
                />
            )}

            <div
                role="dialog"
                aria-modal="true"
                aria-label={isEditing ? 'Edit application' : 'New application'}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100dvh',
                    width: bp === 'mobile' ? '100vw' : `${drawerWidth}px`,
                    background: 'var(--color-white)',
                    borderLeft: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 50,
                    transform: open ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform var(--transition-slow)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >

                {bp !== 'mobile' && open && (
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            left: '-28px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'col-resize',
                            color: handleHovered ? 'var(--color-white)' : 'var(--color-accent)',
                            background: handleHovered ? 'var(--color-accent)' : 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        onMouseEnter={() => setHandleHovered(true)}
                        onMouseLeave={() => setHandleHovered(false)}
                    >
                        <ChevronsLeftRight size={16} />
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <h2 style={{ fontSize: 'var(--text-lg)' }}>
                        {isEditing ? 'Edit application' : 'New application'}
                    </h2>
                    <button
                        aria-label="Close drawer"
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form
                    id="application-form"
                    onSubmit={handleSubmit}
                    aria-label={
                        isEditing ? 'Edit application form' : 'New application'
                    }
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 'var(--space-4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}
                >
                    <ApplicationForm values={values} onChange={handleChange} />
                </form>

                <div style={{
                    padding: 'var(--space-4) var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                }}>
                    {error && <p className="field-error" role="alert">{error}</p>}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: '480px' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" form="application-form" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Save application'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
