import { toast } from 'sonner';

import { createClient } from './supabase/client';
import { ApplicationEvent } from './types';

// Deletes an event and offers Undo, which re-creates it with its original id so it comes
// back exactly as it was. Returns whether the delete went through.
export async function deleteEventWithUndo(
    event: ApplicationEvent,
    {
        onRestored,
    }: {
        // Called with the restored event after Undo.
        onRestored: (event: ApplicationEvent) => void;
    }
): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    if (error) {
        toast.error('Could not delete the event. Please try again.');
        return false;
    }

    // Only the event's own columns (callers may pass one with its application embedded).
    const {
        id,
        user_id,
        job_application_id,
        kind,
        event_date,
        start_time,
        note,
        created_at,
        updated_at,
    } = event;
    const row = {
        id,
        user_id,
        job_application_id,
        kind,
        event_date,
        start_time,
        note,
        created_at,
        updated_at,
    };

    toast.success('Event removed', {
        // Longer than the default 4s so there is time to reach the Undo button.
        duration: 8000,
        action: {
            label: 'Undo',
            onClick: async () => {
                const { data, error } = await supabase
                    .from('events')
                    .insert(row)
                    .select()
                    .single();
                if (error) {
                    toast.error(
                        'Could not restore the event. Please add it again.'
                    );
                    return;
                }
                toast.success('Event restored');
                onRestored(data);
            },
        },
    });
    return true;
}
