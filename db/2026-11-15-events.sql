-- Events (interviews, assessments, other) for the calendar. Run in the Supabase SQL editor.
-- Ran against production on 2026-11-15.

create table public.events (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  user_id uuid not null default auth.uid (),
  job_application_id uuid not null,
  kind text not null default 'interview'::text,
  event_date date not null,
  start_time time without time zone null,
  note text null,
  constraint events_pkey primary key (id),
  constraint events_user_id_fkey foreign key (user_id) references auth.users (id) on update cascade on delete cascade,
  constraint events_job_application_id_fkey foreign key (job_application_id) references job_applications (id) on update cascade on delete cascade,
  constraint events_kind_check check (kind in ('interview', 'assessment', 'call', 'other'))
);

create index events_user_id_event_date_idx on public.events (user_id, event_date);
create index events_job_application_id_idx on public.events (job_application_id);

create trigger set_updated_at before update on public.events
for each row execute function update_updated_at ();

-- The project doesn't grant new tables to the API roles automatically (anon has no
-- access at all), so signed-in users need this; RLS below limits them to their own rows.
grant select, insert, update, delete on table public.events to authenticated;

alter table public.events enable row level security;

create policy "Users can read their own events" on public.events
for select to authenticated
using (user_id = (select auth.uid ()));

create policy "Users can add events to their own applications" on public.events
for insert to authenticated
with check (
  user_id = (select auth.uid ())
  and exists (
    select 1 from public.job_applications a
    where a.id = job_application_id and a.user_id = (select auth.uid ())
  )
);

create policy "Users can update their own events" on public.events
for update to authenticated
using (user_id = (select auth.uid ()))
with check (
  user_id = (select auth.uid ())
  and exists (
    select 1 from public.job_applications a
    where a.id = job_application_id and a.user_id = (select auth.uid ())
  )
);

create policy "Users can delete their own events" on public.events
for delete to authenticated
using (user_id = (select auth.uid ()));
