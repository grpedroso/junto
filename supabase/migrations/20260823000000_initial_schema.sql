-- Junto -- initial schema
--
-- Rules that hold for every table in this database:
--   1. RLS enabled, always, with auth.uid() = user_id
--   2. zero PII: no name, email, phone, national id or date of birth
--   3. zero geolocation
--   4. bet amounts only as a band, never exact
--
-- Read the checklist in CONTRIBUTING.md before adding a column.

create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  timezone      text        not null default 'America/Sao_Paulo',
  baseline_pgsi int         check (baseline_pgsi between 0 and 27),
  pgsi_at       timestamptz,
  ema_times     time[]      not null default array['11:00', '17:00', '21:00']::time[],
  goal          text        not null default 'quit' check (goal in ('quit', 'reduce'))
);

create table public.ema_entries (
  id                   uuid primary key,
  user_id              uuid not null references public.users (id) on delete cascade,
  scheduled_at         timestamptz not null,
  answered_at          timestamptz,
  craving              int check (craving between 0 and 10),
  self_efficacy        int check (self_efficacy between 0 and 10),
  mood                 text check (mood in ('calm','anxious','sad','irritated','upbeat','bored')),
  triggers             text[],
  context              text[],
  gambled_since_last   boolean,
  amount_band          text check (amount_band in ('upto_50','from_50_200','from_200_500','over_500')),
  created_at           timestamptz not null default now(),

  -- A null answered_at is the engagement signal (an EMA that went unanswered),
  -- so the answers are only required once it has actually been answered.
  constraint answered_has_answers check (
    answered_at is null
    or (craving is not null and self_efficacy is not null and mood is not null)
  ),
  -- an amount band only makes sense if they bet
  constraint band_only_if_gambled check (
    amount_band is null or gambled_since_last is true
  )
);

create table public.coping_plans (
  id                uuid primary key,
  user_id           uuid not null references public.users (id) on delete cascade,
  trigger_condition text not null,
  action            text not null,
  category          text not null check (category in ('substitution','social','physical','cognitive','environmental')),
  triggers          text[] not null default '{}',
  times_shown       int  not null default 0 check (times_shown >= 0),
  times_worked      int  not null default 0 check (times_worked >= 0),
  archived_at       timestamptz,
  created_at        timestamptz not null default now(),

  constraint worked_never_exceeds_shown check (times_worked <= times_shown)
);

create table public.interventions (
  id             uuid primary key,
  user_id        uuid not null references public.users (id) on delete cascade,
  ema_id         uuid references public.ema_entries (id) on delete set null,  -- null = came from SOS
  plan_id        uuid references public.coping_plans (id) on delete set null,
  triggered_at   timestamptz not null default now(),
  trigger_reason text check (trigger_reason in ('high_craving','low_self_efficacy','combined','sos')),
  followup_at    timestamptz,
  outcome        text check (outcome in ('resisted','gambled','no_answer'))
);

create index ema_entries_user_scheduled_idx on public.ema_entries (user_id, scheduled_at desc);
create index coping_plans_user_idx          on public.coping_plans (user_id) where archived_at is null;
create index interventions_user_idx         on public.interventions (user_id, triggered_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.users         enable row level security;
alter table public.ema_entries   enable row level security;
alter table public.coping_plans  enable row level security;
alter table public.interventions enable row level security;

create policy "user reads only their own profile"
  on public.users for select using (auth.uid() = id);
create policy "user creates only their own profile"
  on public.users for insert with check (auth.uid() = id);
create policy "user updates only their own profile"
  on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "user deletes only their own profile"
  on public.users for delete using (auth.uid() = id);

create policy "user reads only their own emas"
  on public.ema_entries for select using (auth.uid() = user_id);
create policy "user writes only their own emas"
  on public.ema_entries for insert with check (auth.uid() = user_id);
create policy "user updates only their own emas"
  on public.ema_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user deletes only their own emas"
  on public.ema_entries for delete using (auth.uid() = user_id);

create policy "user reads only their own plans"
  on public.coping_plans for select using (auth.uid() = user_id);
create policy "user writes only their own plans"
  on public.coping_plans for insert with check (auth.uid() = user_id);
create policy "user updates only their own plans"
  on public.coping_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user deletes only their own plans"
  on public.coping_plans for delete using (auth.uid() = user_id);

create policy "user reads only their own interventions"
  on public.interventions for select using (auth.uid() = user_id);
create policy "user writes only their own interventions"
  on public.interventions for insert with check (auth.uid() = user_id);
create policy "user updates only their own interventions"
  on public.interventions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user deletes only their own interventions"
  on public.interventions for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Profile row on anonymous sign-up
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Delete everything -- an LGPD requirement and a promise made in the onboarding
-- ---------------------------------------------------------------------------

create function public.delete_my_data()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'no session';
  end if;

  -- the cascade from public.users covers the rest
  delete from public.users where id = auth.uid();
  delete from auth.users  where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public;
grant execute on function public.delete_my_data() to authenticated;
