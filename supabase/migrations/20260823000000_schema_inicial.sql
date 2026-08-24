-- Junto -- schema inicial
--
-- Regras que valem para toda tabela deste banco:
--   1. RLS habilitada, sempre, com auth.uid() = user_id
--   2. zero PII: nenhum nome, email, telefone, CPF ou data de nascimento
--   3. zero geolocalizacao
--   4. valor de aposta so em faixa, nunca exato
--
-- Ver o checklist em CONTRIBUTING.md antes de adicionar coluna.

create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  timezone      text        not null default 'America/Sao_Paulo',
  baseline_pgsi int         check (baseline_pgsi between 0 and 27),
  pgsi_at       timestamptz,
  ema_times     time[]      not null default array['11:00', '17:00', '21:00']::time[],
  goal          text        not null default 'parar' check (goal in ('parar', 'reduzir'))
);

create table public.ema_entries (
  id                   uuid primary key,
  user_id              uuid not null references public.users (id) on delete cascade,
  scheduled_at         timestamptz not null,
  answered_at          timestamptz,
  craving              int check (craving between 0 and 10),
  self_efficacy        int check (self_efficacy between 0 and 10),
  mood                 text check (mood in ('tranquilo','ansioso','triste','irritado','animado','entediado')),
  triggers             text[],
  context              text[],
  gambled_since_last   boolean,
  amount_band          text check (amount_band in ('ate_50','50_200','200_500','mais_500')),
  created_at           timestamptz not null default now(),

  -- answered_at nulo e o dado de engajamento (EMA nao respondida), entao as
  -- respostas so sao obrigatorias quando ela foi respondida.
  constraint respondida_tem_respostas check (
    answered_at is null
    or (craving is not null and self_efficacy is not null and mood is not null)
  ),
  -- faixa de valor so faz sentido se apostou
  constraint faixa_so_se_apostou check (
    amount_band is null or gambled_since_last is true
  )
);

create table public.coping_plans (
  id                uuid primary key,
  user_id           uuid not null references public.users (id) on delete cascade,
  trigger_condition text not null,
  action            text not null,
  category          text not null check (category in ('substituicao','social','fisico','cognitivo','ambiental')),
  triggers          text[] not null default '{}',
  times_shown       int  not null default 0 check (times_shown >= 0),
  times_worked      int  not null default 0 check (times_worked >= 0),
  archived_at       timestamptz,
  created_at        timestamptz not null default now(),

  constraint funcionou_nao_passa_de_mostrado check (times_worked <= times_shown)
);

create table public.interventions (
  id             uuid primary key,
  user_id        uuid not null references public.users (id) on delete cascade,
  ema_id         uuid references public.ema_entries (id) on delete set null,  -- null = veio do SOS
  plan_id        uuid references public.coping_plans (id) on delete set null,
  triggered_at   timestamptz not null default now(),
  trigger_reason text check (trigger_reason in ('craving_alto','autoeficacia_baixa','combinado','sos')),
  followup_at    timestamptz,
  outcome        text check (outcome in ('resistiu','apostou','sem_resposta'))
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

create policy "usuario le so o proprio perfil"
  on public.users for select using (auth.uid() = id);
create policy "usuario cria so o proprio perfil"
  on public.users for insert with check (auth.uid() = id);
create policy "usuario altera so o proprio perfil"
  on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "usuario apaga so o proprio perfil"
  on public.users for delete using (auth.uid() = id);

create policy "usuario le so as proprias emas"
  on public.ema_entries for select using (auth.uid() = user_id);
create policy "usuario escreve so as proprias emas"
  on public.ema_entries for insert with check (auth.uid() = user_id);
create policy "usuario altera so as proprias emas"
  on public.ema_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usuario apaga so as proprias emas"
  on public.ema_entries for delete using (auth.uid() = user_id);

create policy "usuario le so os proprios planos"
  on public.coping_plans for select using (auth.uid() = user_id);
create policy "usuario escreve so os proprios planos"
  on public.coping_plans for insert with check (auth.uid() = user_id);
create policy "usuario altera so os proprios planos"
  on public.coping_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usuario apaga so os proprios planos"
  on public.coping_plans for delete using (auth.uid() = user_id);

create policy "usuario le so as proprias intervencoes"
  on public.interventions for select using (auth.uid() = user_id);
create policy "usuario escreve so as proprias intervencoes"
  on public.interventions for insert with check (auth.uid() = user_id);
create policy "usuario altera so as proprias intervencoes"
  on public.interventions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usuario apaga so as proprias intervencoes"
  on public.interventions for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Perfil na criacao da conta anonima
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
-- Apagar tudo -- exigencia da LGPD e promessa feita no onboarding
-- ---------------------------------------------------------------------------

create function public.delete_my_data()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'sem sessao';
  end if;

  -- o cascade de public.users cobre o resto
  delete from public.users where id = auth.uid();
  delete from auth.users  where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public;
grant execute on function public.delete_my_data() to authenticated;
