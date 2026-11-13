'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { JobApplication, WorkType } from '@/lib/types';
import { todayLocal } from '@/lib/dates';

import { X } from 'lucide-react';
import ApplicationForm from './ApplicationForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    application?: JobApplication;
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

// Form values for an existing application, or an empty form for a new one.
const initialValues = (application?: JobApplication): FormValues => ({
    title: application?.title ?? '',
    company: application?.company ?? '',
    location: application?.location ?? '',
    workType: application?.work_type ?? 'hybrid',
    deadline: application?.deadline ?? '',
    appliedAt: application?.applied_at?.split('T')[0] ?? todayLocal(),
    url: application?.url ?? '',
    description: application?.description ?? '',
    notes: application?.notes ?? '',
});

export default function ApplicationDrawer({
    open,
    onClose,
    application,
}: DrawerProps) {

    const [values, setValues] = useState<FormValues>(() => initialValues(application));


    const isEditing = !!application;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const openerRef = useRef<HTMLElement | null>(null);

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
            toast.success('Changes saved');
        } else {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setError('Your session has expired. Please sign in again.');
                setLoading(false);
                return;
            }

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
                    : new Date(todayLocal()).toISOString(),
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
            toast.success('Application added');
        }

        setLoading(false);
    };

    const handleChange = (field: keyof FormValues, value: string) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => setValues(initialValues());

    return (
        // Radix (via shadcn's Sheet) handles the overlay, focus trap, Escape, scroll lock,
        // returning focus to the opener and keeping the closed drawer out of the tab order.
        <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent
                side="right"
                showCloseButton={false}
                aria-describedby={undefined}
                // Focus the first form field instead of the close button when opening,
                // and remember what opened the drawer (focus hasn't moved yet at this point).
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    // Editing always starts from the saved values, so changes from a cancelled
                    // edit don't linger. A new-application draft is kept until it is saved.
                    if (application) setValues(initialValues(application));
                    setError(null);
                    openerRef.current = document.activeElement as HTMLElement | null;
                    formRef.current
                        ?.querySelector<HTMLElement>('input, select, textarea, button')
                        ?.focus({ preventScroll: true });
                }}
                // The drawer is opened from plain buttons rather than a SheetTrigger, so Radix
                // has no trigger to return focus to. Return it to the opener ourselves.
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    openerRef.current?.focus({ preventScroll: true });
                }}
                className="w-full gap-0 sm:max-w-[600px]"
            >
                <div className="flex items-center justify-between border-b border-border p-4">
                    <SheetTitle className="text-lg">
                        {isEditing ? 'Edit application' : 'New application'}
                    </SheetTitle>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" aria-label="Close drawer">
                            <X size={16} />
                        </Button>
                    </SheetClose>
                </div>

                <form
                    id="application-form"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    aria-label={
                        isEditing ? 'Edit application form' : 'New application'
                    }
                    className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4"
                >
                    <ApplicationForm values={values} onChange={handleChange} />
                </form>

                <div className="flex flex-col gap-2 border-t border-border p-4">
                    {error && <p className="field-error" role="alert">{error}</p>}
                    <div className="flex max-w-[480px] gap-2">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="flex-1">
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button type="submit" form="application-form" loading={loading} className="flex-1">
                            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Save application'}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
