-- FirstStep: let members delete their data, strip contact details from
-- logged questions, and clean up old data every day (T-32, Architecture Step 9).

-- ---------------------------------------------------------------------------
-- delete_my_account(): deletes the signed-in person and all of their rows.
-- It takes no arguments, so nobody can name another person's ID.
-- Every FirstStep table uses "on delete cascade", so deleting the account
-- removes the session, events, feedback, handoffs and logged questions too.
-- ---------------------------------------------------------------------------
create function public.delete_my_account()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  person uuid := auth.uid();
begin
  -- Fail closed: no signed-in person means nothing is deleted.
  if person is null then
    return false;
  end if;

  delete from public.usage_counters where bucket = person::text;
  delete from auth.users where id = person;
  return found;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Remove email addresses and phone numbers from logged questions before
-- they are saved, so they never reach the table.
-- ---------------------------------------------------------------------------
create function public.redact_contact_details()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.question_text := regexp_replace(
    new.question_text,
    '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    '[email removed]',
    'g'
  );
  new.question_text := regexp_replace(
    new.question_text,
    '\+?[0-9][0-9 ().-]{6,}[0-9]',
    '[phone removed]',
    'g'
  );
  return new;
end;
$$;

revoke all on function public.redact_contact_details() from public, anon, authenticated;

create trigger unanswered_questions_redact
  before insert or update on public.unanswered_questions
  for each row execute function public.redact_contact_details();

-- ---------------------------------------------------------------------------
-- cleanup_old_data(): runs daily inside the database, so the app never
-- needs the secret key. Nobody else may call it.
-- ---------------------------------------------------------------------------
create function public.cleanup_old_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Logged questions are kept for 30 days.
  delete from public.unanswered_questions
  where created_at < now() - interval '30 days';

  -- Guests with no activity for 30 days are removed with all their rows.
  -- Members who saved progress with Google are kept until they delete.
  delete from auth.users u
  where u.is_anonymous
    and u.created_at < now() - interval '30 days'
    and not exists (
      select 1 from public.sessions s
      where s.user_id = u.id
        and s.updated_at >= now() - interval '30 days'
    );

  -- Usage counters are only needed for the current hour and day.
  delete from public.usage_counters
  where window_start < now() - interval '2 days';
end;
$$;

revoke all on function public.cleanup_old_data() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Run the cleanup every day at 03:17 UTC with Supabase's pg_cron.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'firststep-daily-cleanup',
  '17 3 * * *',
  'select public.cleanup_old_data()'
);
