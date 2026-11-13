'use client';

import { WorkType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

type ApplicationFormProps = {
    values: FormValues;
    onChange: (field: keyof FormValues, value: string) => void;
};

// Grows a textarea to fit its content (used for description and notes).
const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
};

// Short fields stay at a readable width even in a wide drawer.
const shortField = 'max-w-[480px]';

export default function ApplicationForm({
    values,
    onChange,
}: ApplicationFormProps) {
    return (
        <>
            <div>
                <Label htmlFor="title">Job title *</Label>
                <Input
                    id="title"
                    value={values.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                    className={shortField}
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
                    className={shortField}
                />
            </div>
            <div>
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={values.location}
                    onChange={(e) => onChange('location', e.target.value)}
                    placeholder="e.g. Stockholm"
                    className={shortField}
                />
            </div>
            <div>
                <Label htmlFor="workType">Work type</Label>
                <Select
                    value={values.workType}
                    onValueChange={(value) => onChange('workType', value)}
                >
                    <SelectTrigger id="workType" className={`w-full ${shortField}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                    id="deadline"
                    type="date"
                    value={values.deadline}
                    onChange={(e) => onChange('deadline', e.target.value)}
                    className={shortField}
                />
            </div>
            <div>
                <Label htmlFor="appliedAt">Date applied</Label>
                <Input
                    id="appliedAt"
                    type="date"
                    value={values.appliedAt}
                    onChange={(e) => onChange('appliedAt', e.target.value)}
                    className={shortField}
                />
            </div>
            <div>
                <Label htmlFor="url">Job posting URL</Label>
                <Input
                    id="url"
                    type="url"
                    value={values.url}
                    onChange={(e) => onChange('url', e.target.value)}
                    placeholder="https://..."
                    className={shortField}
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
                    placeholder="Paste the job description here..."
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
                    placeholder="Your thoughts..."
                    className="min-h-[120px] resize-none overflow-hidden"
                />
            </div>
        </>
    );
}
