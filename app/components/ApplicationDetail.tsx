'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { JobApplication, Status, Contact } from '@/lib/types';
import {
    ArrowLeft,
    Pencil,
    Activity,
    FileText,
    StickyNote,
    Users,
    Building2,
    MapPin,
    Briefcase,
    Calendar,
    Plus,
    Trash2,
    ExternalLink,
} from 'lucide-react';

import ApplicationDrawer from './ApplicationDrawer';
import SectionLabel from './SectionLabel';

type ApplicationDetailProps = {
    application: JobApplication;
};

const statusOptions: Status[] = [
    'applied',
    'assessment',
    'interview',
    'offer',
    'rejected',
    'withdrawn',
];

const statusLabels: Record<string, string> = {
    all: 'All',
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

const workTypeLabels: Record<string, string> = {
    'on-site': 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
};

export default function ApplicationDetail({
    application,
}: ApplicationDetailProps) {
    const [status, setStatus] = useState<Status>(application.status);
    const [deleting, setDeleting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [addingContact, setAddingContact] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [contactError, setContactError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchContacts = async () => {
            const { data } = await supabase
                .from('contacts')
                .select('*')
                .eq('job_application_id', application.id);
            if (data) setContacts(data);
        };
        fetchContacts();
    }, [application.id, supabase]);

    const handleStatusChange = async (newStatus: Status) => {
        const previous = status;

        setStatus(newStatus);

        const { error } = await supabase
            .from('job_applications')
            .update({ status: newStatus })
            .eq('id', application.id);

        if (error) {
            setStatus(previous);
        } else {
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this application?'))
            return;
        setDeleting(true);
        setDeleteError(null);
        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', application.id);

        if (error) {
            setDeleteError('Could not delete application. Please try again.');
            setDeleting(false);
            return;
        }
        router.push('/applications');
        router.refresh();
    };

    const handleAddContact = async () => {
        setContactError(null);
        if (!contactName.trim()) return;
        const { data, error } = await supabase
            .from('contacts')
            .insert({
                job_application_id: application.id,
                name: contactName,
                email: contactEmail || null,
                role: contactRole || null,
            })
            .select()
            .single();

        if(error) {
            setContactError('Could not add contact. Please try again.')
            return
        }
        setContacts([...contacts, data]);
        setContactName('');
        setContactEmail('');
        setContactRole('');
        setAddingContact(false);
        setContactError(null);
    };

    const handleDeleteContact = async (id: string) => {
        setContactError(null);
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) {
            setContactError('Could not delete contact. Please try again.');
            return
        }
        setContacts(contacts.filter((c) => c.id !== id));
    };

    return (
        <>
            <div style={{ padding: 'var(--space-8)', maxWidth: '680px' }}>
                <button
                    onClick={() => router.back()}
                    aria-label="Go back to applications"
                    className="btn btn-ghost btn-sm"
                    style={{ marginBottom: 'var(--space-6)' }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-3)',
                        }}
                    >
                        <h1 style={{ fontSize: 'var(--text-2xl)' }}>
                            {application.title}
                        </h1>

                        {/* Metadata for a job application */}
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--space-4)',
                            }}
                        >
                            {application.company && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <Building2
                                        size={14}
                                        color="var(--color-text-tertiary)"
                                    />
                                    {application.company}
                                </span>
                            )}
                            {application.location && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <MapPin
                                        size={14}
                                        color="var(--color-text-tertiary)"
                                    />
                                    {application.location}
                                </span>
                            )}
                            {application.work_type && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <Briefcase
                                        size={14}
                                        color="var(--color-text-tertiary)"
                                    />
                                    {workTypeLabels[application.work_type]}
                                </span>
                            )}
                        </div>

                        {/* Dates */}
                        <div
                            style={{
                                display: 'flex',
                                gap: 'var(--space-4)',
                                flexWrap: 'wrap',
                            }}
                        >
                            {application.applied_at && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--color-text-tertiary)',
                                    }}
                                >
                                    <Calendar size={12} />
                                    Sent{' '}
                                    {new Date(
                                        application.applied_at
                                    ).toLocaleDateString('sv-SE')}
                                </span>
                            )}
                            {application.deadline && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--color-text-tertiary)',
                                    }}
                                >
                                    <Calendar size={12} />
                                    Deadline{' '}
                                    {new Date(
                                        application.deadline
                                    ).toLocaleDateString('sv-SE')}
                                </span>
                            )}
                        </div>

                        {/* Show external link to job posting if added */}
                        {application.url && (
                            <Link
                                href={application.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm"
                                style={{
                                    color: 'var(--color-accent)',
                                    fontSize: 'var(--text-sm)',
                                    alignSelf: 'flex-start',
                                }}
                            >
                                <ExternalLink size={14} />
                                View job posting
                            </Link>
                        )}
                    </div>

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDrawerOpen(true)}
                        style={{ flexShrink: 0 }}
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                </div>

                <hr />

                {/* Status */}
                <div style={{ padding: 'var(--space-4) 0' }}>
                    <SectionLabel
                        icon={<Activity size={16} />}
                        label="Status"
                    />
                    <div
                        style={{
                            display: 'flex',
                            gap: 'var(--space-2)',
                            flexWrap: 'wrap',
                        }}
                    >
                        {statusOptions.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                aria-pressed={status === s}
                                className={`badge badge-dot badge-${s}`}
                                style={{
                                    cursor: 'pointer',
                                    border:
                                        status === s
                                            ? '2px solid currentColor'
                                            : '1px solid',
                                    opacity: status === s ? 1 : 0.45,
                                    padding: '6px 12px',
                                }}
                            >
                                {statusLabels[s]}
                            </button>
                        ))}
                    </div>
                </div>

                <hr />

                {/* Job description */}
                <div style={{ padding: 'var(--space-4) 0' }}>
                    <SectionLabel
                        icon={<FileText size={16} />}
                        label="Job description"
                    />
                    {application.description ? (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {application.description}
                        </p>
                    ) : (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-disabled)',
                            }}
                        >
                            No description added.
                        </p>
                    )}
                </div>

                <hr />

                {/* Notes */}
                <div style={{ padding: 'var(--space-4) 0' }}>
                    <SectionLabel
                        icon={<StickyNote size={16} />}
                        label="Notes"
                    />
                    {application.notes ? (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {application.notes}
                        </p>
                    ) : (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-disabled)',
                            }}
                        >
                            No notes added.
                        </p>
                    )}
                </div>

                <hr />

                {/* Contacts */}
                <div style={{ padding: 'var(--space-4) 0' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-3)',
                        }}
                    >
                        <SectionLabel
                            icon={<Users size={16} />}
                            label="Contacts"
                        />
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setAddingContact(!addingContact)}
                        >
                            <Plus size={14} />
                            Add
                        </button>
                    </div>

                    {addingContact && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-4)',
                                background: 'var(--color-surface)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-4)',
                            }}
                        >
                            <input
                                placeholder="Name *"
                                value={contactName}
                                aria-label="Contact name"
                                onChange={(e) => setContactName(e.target.value)}
                            />
                            <input
                                placeholder="Email"
                                aria-label="Contact email"
                                value={contactEmail}
                                onChange={(e) =>
                                    setContactEmail(e.target.value)
                                }
                            />
                            <input
                                placeholder="Role (e.g. Recruiter)"
                                aria-label="Contact role"
                                value={contactRole}
                                onChange={(e) => setContactRole(e.target.value)}
                            />
                            {contactError && <p className="field-error" role="alert">{contactError}</p>}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 'var(--space-2)',
                                }}
                            >
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAddContact}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setAddingContact(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {contacts.length === 0 && !addingContact && (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-disabled)',
                            }}
                        >
                            No contacts added.
                        </p>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-2)',
                        }}
                    >
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: 'var(--color-surface)',
                                    borderRadius: 'var(--radius-lg)',
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: '500',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {contact.name}
                                    </p>
                                    {contact.role && (
                                        <p
                                            style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--color-text-tertiary)',
                                            }}
                                        >
                                            {contact.role}
                                        </p>
                                    )}
                                    {contact.email && (
                                        <p
                                            style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--color-text-tertiary)',
                                            }}
                                        >
                                            {contact.email}
                                        </p>
                                    )}
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    aria-label={`Delete contact ${contact.name}`}
                                    onClick={() =>
                                        handleDeleteContact(contact.id)
                                    }
                                >
                                    <Trash2
                                        size={14}
                                        color="var(--color-danger)"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <hr />

                {/* Delete */}
                <div
                    style={{
                        padding: 'var(--space-6) 0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 'var(--space-2)',
                    }}
                >
                    {deleteError && <p className="field-error" role="alert">{deleteError}</p>}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn btn-danger btn-sm"
                    >
                        {deleting ? 'Deleting...' : 'Delete application'}
                    </button>
                </div>
            </div>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                application={application}
            />
        </>
    );
}
