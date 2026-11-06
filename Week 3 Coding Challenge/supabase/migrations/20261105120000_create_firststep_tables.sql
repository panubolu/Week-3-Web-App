-- FirstStep: create the six tables, access rules and usage limits.
-- Follows the Database Design in docs/technical-architecture.md.

-- ---------------------------------------------------------------------------
-- sessions: one member's progress. Each person has one session.
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  current_step text not null default 'goal'
    check (current_step in ('goal', 'experience', 'availability', 'results', 'no_match', 'feedback')),
  goal text
    check (goal in ('project_experience', 'learning', 'community_involvement', 'not_sure')),
  experience_level text
    check (experience_level in ('new_to_tech', 'some_experience', 'experienced_in_tech')),
  availability text
    check (availability in ('under_5', '5_to_10', '10_to_20', 'more_than_20')),
  miss_count integer not null default 0 check (miss_count >= 0),
  completed boolean not null default false,
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Lets the log tables prove a session belongs to the same person.
  unique (id, user_id)
);

-- ---------------------------------------------------------------------------
-- unanswered_questions: questions FirstStep could not answer.
-- ---------------------------------------------------------------------------
create table public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null,
  question_text text not null check (char_length(question_text) between 1 and 500),
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- handoffs: each "Talk to a person" click.
-- ---------------------------------------------------------------------------
create table public.handoffs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null,
  step text not null
    check (step in ('goal', 'experience', 'availability', 'results', 'no_match', 'feedback')),
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- step_events: progress and recommendation clicks, for the KPIs.
-- ---------------------------------------------------------------------------
create table public.step_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null,
  step text not null
    check (step in ('goal', 'experience', 'availability', 'results', 'no_match', 'feedback')),
  event_type text not null
    check (event_type in ('started', 'answered', 'edited', 'completed', 'recommendation_clicked')),
  opportunity_id text check (char_length(opportunity_id) between 1 and 100),
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade,
  -- A click must name an opportunity, and only a click may name one.
  check ((event_type = 'recommendation_clicked') = (opportunity_id is not null))
);

-- ---------------------------------------------------------------------------
-- feedback: one "Was this helpful?" answer per session.
-- ---------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  user_id uuid not null,
  helpful boolean not null,
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- usage_counters: Claude calls per person and for the whole app.
-- Only consume_chat_quota() may touch this table.
-- ---------------------------------------------------------------------------
create table public.usage_counters (
  bucket text not null,
  window_start timestamptz not null,
  call_count integer not null default 0 check (call_count >= 0),
  primary key (bucket, window_start)
);

-- Indexes for the foreign keys, so lookups and account deletion stay fast.
create index unanswered_questions_session_id_idx on public.unanswered_questions (session_id, user_id);
create index handoffs_session_id_idx on public.handoffs (session_id, user_id);
create index step_events_session_id_idx on public.step_events (session_id, user_id);
create index feedback_session_id_user_id_idx on public.feedback (session_id, user_id);

-- Keep updated_at correct on every change.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: the database itself decides who sees each row.
-- ---------------------------------------------------------------------------
alter table public.sessions enable row level security;
alter table public.unanswered_questions enable row level security;
alter table public.handoffs enable row level security;
alter table public.step_events enable row level security;
alter table public.feedback enable row level security;
alter table public.usage_counters enable row level security;

-- sessions: owners can read, add and change their own row.
create policy "Owners can read their session"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their session"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can change their session"
  on public.sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Log tables: owners can read and add their own rows. Nobody changes them.
create policy "Owners can read their questions"
  on public.unanswered_questions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their questions"
  on public.unanswered_questions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can read their handoffs"
  on public.handoffs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their handoffs"
  on public.handoffs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can read their events"
  on public.step_events for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their events"
  on public.step_events for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can read their feedback"
  on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their feedback"
  on public.feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- usage_counters has RLS on and no policies, so everything is denied.

-- ---------------------------------------------------------------------------
-- Grants: new tables are not exposed automatically, so list access here.
-- RLS then narrows these down to each person's own rows.
-- ---------------------------------------------------------------------------
revoke all on public.sessions, public.unanswered_questions, public.handoffs,
  public.step_events, public.feedback, public.usage_counters
  from anon, authenticated;

grant select, insert, update on public.sessions to authenticated;
grant select, insert on public.unanswered_questions to authenticated;
grant select, insert on public.handoffs to authenticated;
grant select, insert on public.step_events to authenticated;
grant select, insert on public.feedback to authenticated;

-- ---------------------------------------------------------------------------
-- consume_chat_quota(): counts one Claude call, or says no.
-- Returns true when the call may go ahead.
-- ---------------------------------------------------------------------------
create function public.consume_chat_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  person_limit constant integer := 30;  -- Claude calls per person, per hour
  app_limit constant integer := 300;    -- Claude calls for the whole app, per day
  person uuid := auth.uid();
  person_bucket text;
  hour_start timestamptz := date_trunc('hour', now());
  day_start timestamptz := date_trunc('day', now());
begin
  -- Fail closed: no signed-in person means no Claude call.
  if person is null then
    return false;
  end if;

  person_bucket := person::text;

  insert into public.usage_counters as c (bucket, window_start, call_count)
  values (person_bucket, hour_start, 1)
  on conflict (bucket, window_start) do update
    set call_count = c.call_count + 1
    where c.call_count < person_limit;

  if not found then
    return false;
  end if;

  insert into public.usage_counters as c (bucket, window_start, call_count)
  values ('global', day_start, 1)
  on conflict (bucket, window_start) do update
    set call_count = c.call_count + 1
    where c.call_count < app_limit;

  if not found then
    -- Give the person's call back, because no call will happen.
    update public.usage_counters
      set call_count = call_count - 1
      where bucket = person_bucket and window_start = hour_start;
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.consume_chat_quota() from public, anon;
grant execute on function public.consume_chat_quota() to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
