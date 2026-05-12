'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { JobApplication, WorkType } from '@/lib/types';

import { X } from 'lucide-react';

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    application?: JobApplication;
};

export default function ApplicationDrawer({
    open,
    onClose,
    application,
}: DrawerProps) {
    const isEditing = !!application;

    const [title, setTitle] = useState(application?.title ?? '');
    const [company, setCompany] = useState(application?.company ?? '');
    const [location, setLocation] = useState(application?.location ?? '');
    const [workType, setWorkType] = useState<WorkType>(
        application?.work_type ?? 'hybrid'
    );
    const [deadline, setDeadline] = useState(application?.deadline ?? '');
    const [appliedAt, setAppliedAt] = useState(
        application?.applied_at?.split('T')[0] ??
        new Date().toISOString().split('T')[0]
    );
    const [url, setUrl] = useState(application?.url ?? '');
    const [description, setDescription] = useState(
        application?.description ?? ''
    );
    const [notes, setNotes] = useState(application?.notes ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    title,
                    company,
                    location,
                    work_type: workType,
                    deadline: deadline || null,
                    applied_at: appliedAt
                        ? new Date(appliedAt).toISOString()
                        : null,
                    description: description || null,
                    notes: notes || null,
                    url: url || null,
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
                title,
                company,
                location,
                work_type: workType,
                deadline: deadline || null,
                description: description || null,
                notes: notes || null,
                user_id: user.id,
                status: 'applied',
                applied_at: appliedAt
                    ? new Date(appliedAt).toISOString()
                    : new Date().toISOString(),
                url: url || null,
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

    const resetForm = () => {
        setTitle('');
        setCompany('');
        setLocation('');
        setWorkType('hybrid');
        setDeadline('');
        setAppliedAt(new Date().toISOString().split('T')[0]);
        setDescription('');
        setNotes('');
    };

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
                    height: '100vh',
                    width: '480px',
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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-6)',
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
                    onSubmit={handleSubmit}
                    aria-label={
                        isEditing ? 'Edit application form' : 'New application'
                    }
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 'var(--space-6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div>
                        <label htmlFor="title">Job title *</label>
                        <input
                            id="title"
                            value={title}
                            autoFocus
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Frontend Developer"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="company">Company *</label>
                        <input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Spotify"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Stockholm"
                        />
                    </div>
                    <div>
                        <label htmlFor="workType">Work type</label>
                        <select
                            id="workType"
                            value={workType}
                            onChange={(e) =>
                                setWorkType(e.target.value as WorkType)
                            }
                        >
                            <option value="on-site">On-site</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="deadline">Deadline</label>
                        <input
                            id="deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="appliedAt">Date applied</label>
                        <input
                            id="appliedAt"
                            type="date"
                            value={appliedAt}
                            onChange={(e) => setAppliedAt(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="url">Job posting URL</label>
                        <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Job description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            style={{ minHeight: '120px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Your thoughts..."
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-2)',
                            paddingTop: 'var(--space-4)',
                            borderTop: '1px solid var(--color-border)',
                        }}
                    >
                        {error && <p className="field-error" role="alert">{error}</p>}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                {loading
                                    ? 'Saving...'
                                    : isEditing
                                        ? 'Save changes'
                                        : 'Save application'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
