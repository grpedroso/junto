# Junto — notes for anyone touching the code

Expo has changed a lot. Read the docs for the exact version before writing any
code: https://docs.expo.dev/versions/v57.0.0/

## What this is

An app for people who want to stop gambling. A JITAI: three quick assessments a
day (an EMA), and when craving is high or self-efficacy is low, it shows the
coping plan the person wrote themselves, earlier, with a clear head.

Android first, pt-BR, non-profit, AGPL-3.0.

**Language:** code, comments and docs in English. The strings the user reads are
Brazilian Portuguese and live in `src/i18n/pt-BR.ts` — keys English, values
pt-BR. `PRIVACY.md` also stays in Portuguese; it is shown to users, not to
developers.

## Rules that do not bend

**Clinical review.** Text a person reads in a moment of vulnerability does not
change without a clinical reviewer. The list is in [CONTRIBUTING.md](CONTRIBUTING.md).

**Zero PII.** No column, field or log with a name, email, phone or national id.
Bet amounts as bands only. Zero geolocation. RLS on every table.

**Zero strings in the UI.** Everything in `src/i18n/pt-BR.ts`. That is what lets
the clinical reviewer read everything the user will read in a single file.

**No red.** No screen in this app should look like an alarm — the palette in
`tailwind.config.js` has no red on purpose.

**`src/domain/` is pure TypeScript.** No React, no I/O, no `fetch`. It is the
clinical rule kept isolated so it can be tested and audited. If you needed a hook
or the network in there, the code is in the wrong place.

**Offline-first.** Every write lands in the local queue (`src/lib/storage.ts`)
before the server is tried. The person may have no data during a crisis; SOS and
the Help screen work 100% offline, with the phone numbers hardcoded.

## Where things are

```
app/                     routes (expo-router)
  (onboarding)/          intro → goal → times → plans → PGSI → permissions
  (tabs)/                today, plans, progress, help
  ema.tsx                the six questions
  intervention/[id].tsx  the plan and the 30-minute follow-up
  sos.tsx, care.tsx, settings.tsx
src/
  domain/                ema.ts (trigger rule), scoring.ts (PGSI), plans.ts, progress.ts
  lib/                   supabase, notifications, storage (queue), session (anon auth)
  state/useJunto.ts      zustand; every write goes through here
  components/            base.tsx, Scale, Resources, CravingCurve, PgsiQuestionnaire
  i18n/pt-BR.ts          EVERY string
supabase/migrations/     schema, RLS, delete_my_data()
```

## Commands

```bash
npm start                # metro
npm test                 # 70 tests, domain plus scheduling
npm run typecheck
npx expo export --platform android   # confirms the bundle closes
```

## Traps

**Expo Go is no good for testing notifications** — and on Android it cannot even
*import* `expo-notifications`: the package re-exports a side-effect module that
registers a push token listener at import time, and that listener throws inside
Expo Go. So never import it from a screen. `src/lib/notifications.ts` requires it
lazily, outside Expo Go only, and every function there no-ops without it — that
is what keeps the screens walkable in Expo Go. Scheduling still needs a real
build: killing Expo Go kills the alarms with it. See
[NOTIFICATIONS.md](NOTIFICATIONS.md).

**Jitter requires a concrete date.** Android's daily trigger is a fixed hour, so
`scheduleEmas` schedules 21 days of concrete dates and reschedules on every open
— which is also why scheduling dies if the app is never opened again.

**Do not use `toISOString` to group by day.** In Brazil a 9pm EMA falls on the
next day in UTC and the day counter comes out wrong. `src/domain/progress.ts`
uses local components.

**React state is not updated inside the same handler.** `app/ema.tsx` passes
`gambledNow` as a parameter for exactly that reason.

**The queue is filtered by id, not overwritten.** Overwriting with "what
remained" loses writes that arrived mid-flush.

**The Supabase anon key is public.** RLS is what protects the data. If a table
ends up without a policy, that is the vulnerability — not the key leaking.

**Local mode is real.** With no `.env` the app runs without Supabase: a
device-generated UUID, nothing syncs. `hasCloud` in `src/lib/supabase.ts` gates it.

## What does not exist yet

- A created Supabase project (the migration is written, has never run)
- `src/types/database.ts` is hand-written; it becomes generated once the project exists
- The Phase 0 result (notification test on a real device)
- A clinical reviewer
- The exact wording of the 9 PGSI-BR items — what is there is provisional
