'use client';

import { WorkType } from "@/lib/types";
import { ChevronDown } from 'lucide-react';

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

export default function ApplicationForm({
    values, onChange
}: ApplicationFormProps) {
    return (
        <>

            <div>
                <label htmlFor="title">Job title *</label>
                <input
                    id="title"
                    value={values.title}
                    autoFocus
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <label htmlFor="company">Company *</label>
                <input
                    id="company"
                    value={values.company}
                    onChange={(e) => onChange('company', e.target.value)}
                    placeholder="e.g. Spotify"
                    required
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <label htmlFor="location">Location</label>
                <input
                    id="location"
                    value={values.location}
                    onChange={(e) => onChange('location', e.target.value)}
                    placeholder="e.g. Stockholm"
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <label htmlFor="workType">Work type</label>
                <div style={{ position: 'relative', maxWidth: '480px' }}>
                    <select
                        id="workType"
                        value={values.workType}
                        onChange={(e) =>
                            onChange('workType', e.target.value as WorkType)
                        }
                    >
                        <option value="on-site">On-site</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="remote">Remote</option>
                    </select>
                    <ChevronDown
                        size={14}
                        style={{
                            position: 'absolute',
                            right: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-tertiary)',
                            pointerEvents: 'none',
                        }}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="deadline">Deadline</label>
                <input
                    id="deadline"
                    type="date"
                    value={values.deadline}
                    onChange={(e) => onChange('deadline', e.target.value)}
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <label htmlFor="appliedAt">Date applied</label>
                <input
                    id="appliedAt"
                    type="date"
                    value={values.appliedAt}
                    onChange={(e) => onChange('appliedAt', e.target.value)}
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <label htmlFor="url">Job posting URL</label>
                <input
                    id="url"
                    type="url"
                    value={values.url}
                    onChange={(e) => onChange('url', e.target.value)}
                    placeholder="https://..."
                    style={{
                        maxWidth: '480px'
                    }}
                />
            </div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <label htmlFor="description">Job description</label>
                </div>
                <textarea
                    id="description"
                    ref={(el) => {
                        if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }
                    }}
                    value={values.description}
                    onChange={(e) => {
                        onChange('description', e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Paste the job description here..."
                    style={{
                        minHeight: '120px',
                        resize: 'none',
                        overflow: 'hidden',
                    }}
                />
            </div>
            <div>
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    value={values.notes}
                    placeholder="Your thoughts..."
                    ref={(el) => {
                        if (el) {
                            el.style.height = 'auto';
                            el.style.height = `${el.scrollHeight}px`;
                        }
                    }}
                    onChange={(e) => {
                        onChange('notes', e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    style={{
                        minHeight: '120px',
                        resize: 'none',
                        overflow: 'hidden',
                    }}
                />
            </div>
        </>
    )
}