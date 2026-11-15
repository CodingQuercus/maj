'use client';

import { WorkType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DatePicker from './DatePicker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Form state for the application drawer. workType "" means "Not specified" (saved as null).
// stage: "saved" = planning to apply (deadline = last day to apply), "applied" = sent.
export type FormValues = {
    stage: 'saved' | 'applied';
    title: string;
    company: string;
    location: string;
    workType: WorkType | '';
    deadline: string;
    appliedAt: string;
    url: string;
    description: string;
    notes: string;
};

type ApplicationFormProps = {
    values: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
    // New applications choose Saved or Applied; existing ones keep their stage.
    isNew: boolean;
};

// Grows a textarea to fit its content (used for description and notes).
const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
};

// Two related fields side by side from sm up, stacked on phones.
const pair = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

export default function ApplicationForm({
    values,
    onChange,
    isNew,
}: ApplicationFormProps) {
    const saved = values.stage === 'saved';
    const stageOption = (
        stage: FormValues['stage'],
        label: string,
        hint: string
    ) => (
        <button
            type="button"
            role="radio"
            aria-checked={values.stage === stage}
            aria-label={`${label}: ${hint}`}
            onClick={() => onChange('stage', stage)}
            className={
                'flex flex-1 cursor-pointer flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left outline-none focus-ring ' +
                (values.stage === stage
                    ? 'border-primary bg-[var(--color-accent-subtle)]'
                    : 'border-border bg-[var(--color-white)] hover:bg-[var(--color-surface)]')
            }
        >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
                {hint}
            </span>
        </button>
    );

    return (
        <>
            {isNew && (
                <div>
                    <span
                        id="stage-label"
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Status
                    </span>
                    <div
                        role="radiogroup"
                        aria-labelledby="stage-label"
                        className="flex gap-2"
                    >
                        {stageOption(
                            'applied',
                            'Already applied',
                            'Log a sent application'
                        )}
                        {stageOption(
                            'saved',
                            'Saved for later',
                            'Remind me to apply'
                        )}
                    </div>
                </div>
            )}
            <div>
                <Label htmlFor="title">Job title *</Label>
                <Input
                    id="title"
                    value={values.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                />
            </div>
            <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                    id="company"
                    value={values.company}
                    onChange={(e) => onChange('company', e.target.value)}
                    placeholder="e.g. Spotify"
                    required
                />
            </div>
            <div className={pair}>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={values.location}
                        onChange={(e) => onChange('location', e.target.value)}
                        placeholder="e.g. Stockholm"
                    />
                </div>
                <div>
                    <Label htmlFor="workType">Work type</Label>
                    {/* Radix Select can't use "" as an item value, so "none" stands in for it. */}
                    <Select
                        value={values.workType || 'none'}
                        onValueChange={(value) =>
                            onChange('workType', value === 'none' ? '' : value)
                        }
                    >
                        <SelectTrigger id="workType" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Not specified</SelectItem>
                            <SelectItem value="on-site">On-site</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* Saved jobs have a last day to apply; applied ones a date applied. */}
            <div className={pair}>
                {saved ? (
                    <div>
                        <Label htmlFor="deadline">Apply by</Label>
                        <DatePicker
                            id="deadline"
                            label="Apply by"
                            value={values.deadline}
                            onChange={(value) => onChange('deadline', value)}
                            placeholder="No deadline"
                            clearable
                        />
                    </div>
                ) : (
                    <div>
                        <Label htmlFor="appliedAt">Date applied</Label>
                        <DatePicker
                            id="appliedAt"
                            label="Date applied"
                            value={values.appliedAt}
                            onChange={(value) => onChange('appliedAt', value)}
                        />
                    </div>
                )}
            </div>
            <div>
                <Label htmlFor="url">Job posting URL</Label>
                <Input
                    id="url"
                    type="url"
                    value={values.url}
                    onChange={(e) => onChange('url', e.target.value)}
                    placeholder="https://…"
                />
            </div>
            <div>
                <Label htmlFor="description">Job description</Label>
                <Textarea
                    id="description"
                    ref={autoGrow}
                    value={values.description}
                    onChange={(e) => {
                        onChange('description', e.target.value);
                        autoGrow(e.target);
                    }}
                    placeholder="Paste the job description here…"
                    className="min-h-[120px] resize-none overflow-hidden"
                />
            </div>
            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    ref={autoGrow}
                    value={values.notes}
                    onChange={(e) => {
                        onChange('notes', e.target.value);
                        autoGrow(e.target);
                    }}
                    placeholder="Your thoughts…"
                    className="min-h-[120px] resize-none overflow-hidden"
                />
            </div>
        </>
    );
}
