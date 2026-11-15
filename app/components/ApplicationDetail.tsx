'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { JobApplication, Contact, ApplicationEvent } from '@/lib/types';
import { formatDate } from '@/lib/dates';

import { WORK_TYPE_LABELS } from '@/lib/status';
import { lastApplicationsUrl } from '@/lib/navigation';

import {
    ArrowLeft,
    Pencil,
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
import EventsSection from './EventsSection';
import SectionLabel from './SectionLabel';
import StatusPopover from './StatusPopover';

type ApplicationDetailProps = {
    application: JobApplication;
    // Loaded on the server together with the application.
    initialContacts: Contact[];
    initialEvents: ApplicationEvent[];
};

export default function ApplicationDetail({
    application,
    initialContacts,
    initialEvents,
}: ApplicationDetailProps) {
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

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

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

    // Shared styles for the small meta rows under the title.
    const metaItem = 'flex items-center gap-1 text-sm text-[var(--color-text-secondary)]';
    const metaIcon = 'text-[var(--color-text-tertiary)]';
    const emptyText = 'text-sm text-[var(--color-text-tertiary)]';

    return (
        <>
            <div className="p-4 sm:p-8">
                {/* A real link to the list (works when opened from a shared link too). A plain
                    click returns to the list with the filters the user left it with. */}
                <Button asChild variant="ghost" size="sm" className="mb-2 sm:mb-3">
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
                <header className="mb-3 flex flex-col gap-3 sm:mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="min-w-0 text-xl break-words sm:text-3xl">{application.title}</h1>
                        <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
                            <Pencil size={14} aria-hidden="true" />
                            Edit
                        </Button>
                    </div>

                    {/* Status uses the same menu as the list, so it is changed the same way everywhere. */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Keyed by status so it picks up a change made elsewhere on the page
                            (e.g. "Set status to Interview" after adding an interview). */}
                        <StatusPopover
                            key={application.status}
                            applicationId={application.id}
                            currentStatus={application.status}
                        />
                        {application.company && (
                            <span className={metaItem}>
                                <Building2 size={14} aria-hidden="true" className={metaIcon} />
                                {application.company}
                            </span>
                        )}
                        {application.location && (
                            <span className={metaItem}>
                                <MapPin size={14} aria-hidden="true" className={metaIcon} />
                                {application.location}
                            </span>
                        )}
                        {application.work_type && (
                            <span className={metaItem}>
                                <Briefcase size={14} aria-hidden="true" className={metaIcon} />
                                {WORK_TYPE_LABELS[application.work_type]}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-tertiary)] tabular-nums">
                        {application.applied_at && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} aria-hidden="true" />
                                Applied {formatDate(application.applied_at)}
                            </span>
                        )}
                        {application.deadline && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} aria-hidden="true" />
                                Deadline {formatDate(application.deadline)}
                            </span>
                        )}
                    </div>
                </header>

                <hr />

                {/* Events first: an upcoming interview is what you open an application for. */}
                <EventsSection
                    applicationId={application.id}
                    status={application.status}
                    initialEvents={initialEvents}
                />

                <hr />

                {/* Job description */}
                <section className="py-4">
                    <div className="mb-3 flex items-center justify-between">
                        <SectionLabel icon={<FileText size={16} />} label="Job description" noMargin />
                        {application.url && (
                            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                                <Link href={application.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={16} aria-hidden="true" />
                                    View posting
                                </Link>
                            </Button>
                        )}
                    </div>
                    {application.description ? (
                        <p className="max-w-[700px] text-sm whitespace-pre-wrap">{application.description}</p>
                    ) : (
                        <p className={emptyText}>No description added.</p>
                    )}
                </section>

                <hr />

                {/* Notes */}
                <section className="py-4">
                    <SectionLabel icon={<StickyNote size={16} />} label="Notes" />
                    {application.notes ? (
                        <p className="max-w-[700px] text-sm whitespace-pre-wrap">{application.notes}</p>
                    ) : (
                        <p className={emptyText}>No notes added.</p>
                    )}
                </section>

                <hr />

                {/* Contacts */}
                <section className="py-4">
                    <div className="mb-3 flex items-center justify-between">
                        <SectionLabel icon={<Users size={16} />} label="Contacts" noMargin />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingContact(!addingContact)}
                            aria-expanded={addingContact}
                        >
                            <Plus size={14} aria-hidden="true" />
                            Add
                        </Button>
                    </div>

                    {addingContact && (
                        <div className="mb-4 flex max-w-[480px] flex-col gap-3 rounded-lg bg-muted p-4">
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
                                onChange={(e) => setContactEmail(e.target.value)}
                            />
                            <Input
                                placeholder="Role (e.g. Recruiter)"
                                aria-label="Contact role"
                                value={contactRole}
                                onChange={(e) => setContactRole(e.target.value)}
                            />
                            {contactError && (
                                <p className="field-error" role="alert">
                                    {contactError}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAddContact} loading={savingContact}>
                                    {savingContact ? 'Saving…' : 'Save'}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setAddingContact(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {contacts.length === 0 && !addingContact && (
                        <p className={emptyText}>No contacts added.</p>
                    )}

                    <ul className="flex flex-col gap-2">
                        {contacts.map((contact) => (
                            <li
                                key={contact.id}
                                className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                                    {contact.role && (
                                        <p className="truncate text-xs text-[var(--color-text-tertiary)]">{contact.role}</p>
                                    )}
                                    {contact.email && (
                                        <p className="truncate text-xs text-[var(--color-text-tertiary)]">{contact.email}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Delete contact ${contact.name}`}
                                    onClick={() => handleDeleteContact(contact.id)}
                                    loading={deletingContactId === contact.id}
                                >
                                    {deletingContactId !== contact.id && (
                                        <Trash2 size={14} aria-hidden="true" className="text-destructive" />
                                    )}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </section>

                <hr />

                {/* Delete */}
                <section className="flex flex-col items-end gap-2 py-6">
                    {deleteError && (
                        <p className="field-error" role="alert">
                            {deleteError}
                        </p>
                    )}
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
                                <Button variant="destructive" onClick={handleDelete} loading={deleting}>
                                    {deleting ? 'Deleting…' : 'Delete application'}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </section>
            </div>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                application={application}
            />
        </>
    );
}
