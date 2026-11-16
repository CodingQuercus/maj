// Work type options for a job application
export type WorkType = 'on-site' | 'hybrid' | 'remote';

// Status options representing the current stage of an application
export type Status =
    | 'saved'
    | 'applied'
    | 'assessment'
    | 'interview'
    | 'offer'
    | 'rejected'
    | 'withdrawn';

// Represents a job application in the database
export type JobApplication = {
    id: string;
    user_id: string; // FK to auth.users
    title: string;
    company: string;
    location: string | null;
    work_type: WorkType | null;
    status: Status;
    applied_at: string | null;
    deadline: string | null;
    description: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
    url: string | null; // Link to job posting
};

// Represents a contact linked to a job application
export type Contact = {
    id: string;
    job_application_id: string; // FK to job_applications
    name: string | null;
    email: string | null;
    role: string | null;
    created_at: string;
};

// Kinds of dated events on an application (the calendar shows them).
export type EventKind = 'interview' | 'assessment' | 'other';

// An interview, test, call etc. linked to a job application.
export type ApplicationEvent = {
    id: string;
    user_id: string; // FK to auth.users, set by the database
    job_application_id: string; // FK to job_applications
    kind: EventKind;
    event_date: string; // YYYY-MM-DD
    start_time: string | null; // "HH:MM:SS", or null for no set time
    note: string | null;
    created_at: string;
    updated_at: string | null;
};

// An event with the application it belongs to (embedded via job_applications(...)).
export type CalendarEvent = ApplicationEvent & {
    job_applications: Pick<JobApplication, 'id' | 'title' | 'company'>;
};
