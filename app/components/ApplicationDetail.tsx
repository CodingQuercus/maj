'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { JobApplication, Status, Contact } from '@/lib/types';
import { formatDate } from '@/lib/dates';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { STATUSES, STATUS_LABELS, WORK_TYPE_LABELS } from '@/lib/status';
import { lastApplicationsUrl } from '@/lib/navigation';

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

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ApplicationDrawer from './ApplicationDrawer';
import SectionLabel from './SectionLabel';

type ApplicationDetailProps = {
    application: JobApplication;
    // Loaded on the server together with the application.
    initialContacts: Contact[];
};

export default function ApplicationDetail({
    application,
    initialContacts,
}: ApplicationDetailProps) {
    const [status, setStatus] = useState<Status>(application.status);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [savingContact, setSavingContact] = useState(false);
    const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
    const [addingContact, setAddingContact] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [contactError, setContactError] = useState<string | null>(null);

    const bp = useBreakpoint();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const handleStatusChange = async (newStatus: Status) => {
        const previous = status;

        setStatus(newStatus);

        const { error } = await supabase
            .from('job_applications')
            .update({ status: newStatus })
            .eq('id', application.id);

        if (error) {
            setStatus(previous);
            toast.error('Could not update status. Please try again.');
        } else {
            router.refresh();
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError(null);
        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', application.id);

        if (error) {
            setDeleteError('Could not delete application. Please try again.');
            setDeleting(false);
            setConfirmDeleteOpen(false);
            return;
        }
        toast.success('Application deleted');
        router.push(lastApplicationsUrl());
        router.refresh();
    };

    const handleAddContact = async () => {
        setContactError(null);
        if (!contactName.trim()) return;
        setSavingContact(true);
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
        setSavingContact(false);

        if (error) {
            setContactError('Could not add contact. Please try again.')
            return
        }
        toast.success('Contact added');
        setContacts([...contacts, data]);
        setContactName('');
        setContactEmail('');
        setContactRole('');
        setAddingContact(false);
        setContactError(null);
    };

    const handleDeleteContact = async (id: string) => {
        setContactError(null);
        setDeletingContactId(id);
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        setDeletingContactId(null);
        if (error) {
            toast.error('Could not delete contact. Please try again.');
            return
        }
        const removed = contacts.find((c) => c.id === id);
        setContacts(contacts.filter((c) => c.id !== id));
        toast.success('Contact removed', {
            // Longer than the default 4s so there is time to reach the Undo button.
            duration: 8000,
            // Re-creates the contact with its original id and date, so it returns to the same place.
            action: removed && {
                label: 'Undo',
                onClick: () => restoreContact(removed),
            },
        });
    };

    const restoreContact = async (contact: Contact) => {
        const { data, error } = await supabase
            .from('contacts')
            .insert(contact)
            .select()
            .single();
        if (error) {
            toast.error('Could not restore the contact. Please add it again.');
            return;
        }
        setContacts((prev) =>
            [...prev, data].sort((a, b) => a.created_at.localeCompare(b.created_at))
        );
        toast.success('Contact restored');
    };

    const pad = bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)';

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ paddingTop: pad, paddingLeft: pad, paddingRight: pad, paddingBottom: 0}}>
                    {/* A real link to the list (works when opened from a shared link too). A plain
                        click returns to the list with the filters the user left it with. */}
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        style={{ marginBottom: bp === 'mobile' ? 'var(--space-2)' : 'var(--space-3)' }}
                    >
                        <Link
                            href="/applications"
                            onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                                e.preventDefault();
                                router.push(lastApplicationsUrl());
                            }}
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Back to applications
                        </Link>
                    </Button>

                    {/* Header */}
                    <div
                        style={{
                            marginBottom: bp === 'mobile' ? 'var(--space-3)' : 'var(--space-6)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-3)',
                                width: '100%'
                            }}
                        >
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <h1 style={{ fontSize: bp === 'mobile' ? 'var(--text-xl)' : undefined }}>
                                    {application.title}
                                </h1>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDrawerOpen(true)}
                                >
                                    <Pencil size={14} />
                                    Edit
                                </Button>
                            </div>
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
                                        {WORK_TYPE_LABELS[application.work_type]}
                                    </span>
                                )}
                            </div>

                            {/* Dates */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 'var(--space-2)',
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
                                        Applied{' '}
                                        {formatDate(application.applied_at)}
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
                                        {formatDate(application.deadline)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr />
                </div>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingLeft: pad,
                    paddingRight: pad,
                    paddingBottom: bp === 'mobile' ? '164px' : pad,
                }}>

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
                            {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    aria-pressed={status === s}
                                    className={`badge badge-dot badge-toggle badge-${s}`}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr />

                    {/* Job description */}
                    <div style={{ padding: 'var(--space-4) 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <SectionLabel icon={<FileText size={16} />} label="Job description" noMargin />
                            {application.url && (
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary"
                                >
                                    <Link
                                        href={application.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink size={16} />
                                        View posting
                                    </Link>
                                </Button>
                            )}
                        </div>
                        {application.description ? (
                            <p
                                style={{
                                    fontSize: 'var(--text-sm)',
                                    whiteSpace: 'pre-wrap',
                                    maxWidth: '700px'
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
                                    maxWidth: '700px'
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
                                noMargin
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddingContact(!addingContact)}
                                aria-expanded={addingContact}
                            >
                                <Plus size={14} />
                                Add
                            </Button>
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
                                    maxWidth: '480px'
                                }}
                            >
                                <Input
                                    placeholder="Name *"
                                    value={contactName}
                                    aria-label="Contact name"
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                                <Input
                                    type="email"
                                    // The contact's address, not the user's: keep the browser from autofilling it.
                                    autoComplete="off"
                                    spellCheck={false}
                                    placeholder="Email"
                                    aria-label="Contact email"
                                    value={contactEmail}
                                    onChange={(e) =>
                                        setContactEmail(e.target.value)
                                    }
                                />
                                <Input
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
                                    <Button
                                        size="sm"
                                        onClick={handleAddContact}
                                        loading={savingContact}
                                    >
                                        {savingContact ? 'Saving…' : 'Save'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAddingContact(false)}
                                    >
                                        Cancel
                                    </Button>
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
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Delete contact ${contact.name}`}
                                        onClick={() =>
                                            handleDeleteContact(contact.id)
                                        }
                                        loading={deletingContactId === contact.id}
                                    >
                                        {deletingContactId !== contact.id && (
                                            <Trash2
                                                size={14}
                                                color="var(--color-danger)"
                                            />
                                        )}
                                    </Button>
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
                        <AlertDialog
                            open={confirmDeleteOpen}
                            // Stay open while deleting so the spinner stays visible.
                            onOpenChange={(next) => !deleting && setConfirmDeleteOpen(next)}
                        >
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete application
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {`${application.title} at ${application.company} will be permanently deleted. This can't be undone.`}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                    {/* A plain Button rather than AlertDialogAction, which would close the dialog before the delete finishes. */}
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        loading={deleting}
                                    >
                                        {deleting ? 'Deleting…' : 'Delete application'}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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
