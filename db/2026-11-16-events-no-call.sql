-- "Call" is no longer an event kind; calls are "Other". Run in the Supabase SQL editor
-- before deploying the app change (the current app already accepts 'other').

update public.events set kind = 'other' where kind = 'call';

alter table public.events drop constraint events_kind_check;
alter table public.events
  add constraint events_kind_check check (kind in ('interview', 'assessment', 'other'));

-- Demo data: an offer is rarely a booked call, so the demo's Cloudbit event becomes a visit.
update public.events
set note = 'Meet the team at the office'
where note = 'Offer call with the recruiter';
