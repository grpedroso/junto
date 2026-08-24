# Contributing

Thanks for looking. This is a non-profit, solo-dev project and help is welcome —
especially from people who understand gambling addiction, people who have lived
it, and people who know how to test Android properly.

**Language:** code, comments, docs and issues in English. The strings the user
reads are Brazilian Portuguese and stay in `src/i18n/pt-BR.ts` — they are the
product, not translatable filler.

## The rule that does not bend: clinical review

**No PR that changes text a person reads in a moment of vulnerability gets
merged without clinical review.** That includes:

- The care screen (`app/care.tsx`)
- The intervention and follow-up copy
- The EMA questions and their options
- The PGSI items and bands
- The trigger threshold (`src/domain/ema.ts`)
- Any copy about relapse, progress or streaks

Tag the PR with the `clinico` label. If you are not sure whether yours counts,
tag it anyway — a false positive costs nothing.

### Language rules, non-negotiable

These examples are in Portuguese because they are the actual strings, not
illustrations.

| ❌ Never | ✅ Instead |
|---|---|
| "Você recaiu" (*you relapsed*) | "Aconteceu. Bora de novo." (*it happened, let's go again*) |
| "Você falhou em atingir sua meta" | "Semana difícil. Isso acontece." |
| "Parabéns pelos seus 7 dias de abstinência!" | "7 dias. Tá firme." |
| "Detectamos comportamento de risco" | "Parece que hoje tá puxado" |

- **Never** mention self-harm methods — not even as "remove your access to X"
- **Never** a visual alarm (red, danger icon) on the care screen
- A relapse is a **fresh start**: the counter records and moves on, it does not punish
- The care screen never blocks the app and never forces an action

Voice: direct, Brazilian, informal, on the person's side. Not clinical, not
professorial, not generically motivational, not patronising.

## Privacy is not negotiable

The app is anonymous by construction. A PR **must not**:

- Add a column or field with a name, email, phone, national id or any PII
- Store an exact bet amount — bands only (`amount_band`)
- Add geolocation
- Create a table without RLS
- Send an EMA answer to a log, a crash report or any third-party service

Tag anything that touches user data with the `privacidade` label.

## Flow

1. Open an issue before starting anything large — it saves wasted work
2. Branch from `main`
3. `npm test` green
4. `npx tsc --noEmit` clean
5. No new hardcoded string in the UI — everything goes in `src/i18n/pt-BR.ts`
6. Keep the PR small, and describe it in English

## Where the logic lives

`src/domain/` is pure TypeScript: no React, no I/O, no `fetch`. It is the
clinical rule kept apart from everything else so it can be tested and audited.
If you find yourself needing a hook or the network in there, the code is
probably in the wrong place.

## What helps a lot

- Testing on a phone from a battery-aggressive maker (Xiaomi, Samsung, Motorola) and reporting in [NOTIFICATIONS.md](NOTIFICATIONS.md)
- An accessibility pass (contrast, screen reader)
- A copy review by someone working in a CAPS-AD or researching gambling disorder
- The exact wording of the published Brazilian PGSI adaptation

## Security

Vulnerabilities do not go in public issues. See [SECURITY.md](SECURITY.md).
