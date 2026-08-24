# Junto

An app for people who want to stop gambling. The idea is simple: show up at the
right moment with the plan the person wrote themselves, back when they were calm.

The app is in Brazilian Portuguese, for Brazil. The code and the docs are in
English. *Junto* means "together" — the name is the promise.

> **Junto is not an emergency service.** Nobody reads the answers in real time.
> If you need to talk to someone right now, in Brazil: **CVV 188** (free, 24h,
> confidential, also at [cvv.org.br](https://cvv.org.br)) or **SAMU 192**.

## What it is

A [JITAI](https://doi.org/10.1007/s10899-023-10250-x) — a *Just-In-Time Adaptive
Intervention*. Three times a day the app asks six quick questions. When craving
runs high or the sense of being able to resist runs low, it shows the coping plan
the person wrote for that trigger.

Momentary craving and self-efficacy are the two predictors the literature
confirms operate in real time. Expected winnings do not predict anything — which
is why they are not in the questionnaire.

## What it is not

- Not a site or app blocker (Stopou, BetBlocker and Gamban already do that well)
- Not a simulated casino
- It does not screen for suicide risk — it offers a **route to help**, not an assessment
- It does not judge, does not use the language of failure, and does not reset a counter out of guilt

## State

Under construction. Nothing published. The biggest technical risk — Android
killing background notifications — is being validated before anything else: see
[NOTIFICATIONS.md](NOTIFICATIONS.md).

## Running it

You need Node 20+ and an Android phone.

```bash
npm install
npx expo start          # point the camera at the QR code with Expo Go open
```

With no `.env` the app comes up in **local mode**: the anonymous account is
created on the device and nothing syncs. That is enough to walk the screens and
exercise the trigger rule before a backend exists. Once the Supabase project is
there:

```bash
cp .env.example .env    # fill in URL and anon key
npm run types:gen
```

**Expo Go is no good for testing notifications** — killing Expo Go kills the
scheduling with it, so the test measures something else. Use a development build:

```bash
npx eas build --platform android --profile development
```

An emulator is no good for notifications either (the Phase 0 spike refuses to
validate on one). For every other screen an emulator is fine.

### Tests

```bash
npm test
```

What matters lives in `src/domain/` — pure TypeScript, no React and no I/O. That
is where the trigger rule and the PGSI scoring live, and it is what can be
validated without launching the app.

## Layout

```
app/          routes (expo-router)
src/
  domain/     trigger rule, PGSI, jitter — pure, testable
  lib/        supabase, notifications, storage
  i18n/       every string; no hardcoded text in the UI
  components/
supabase/
  migrations/
```

Keys in `src/i18n/pt-BR.ts` are English; the values are Brazilian Portuguese and
stay that way. They are the product.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. The rule that does not bend:
**any change to text a person reads in a moment of vulnerability needs clinical
review** — open it with the `clinico` label.

## Licence

[AGPL-3.0](LICENSE). The choice is deliberate: it stops anyone taking the code,
closing it and monetising it on top of vulnerable people. That risk is real in
this niche.
