# Security policy

This app holds health data belonging to people in a vulnerable situation. A flaw
here does not expose generic "user data" — it exposes that someone has a
gambling problem, how much they bet and what emotional state they were in. Treat
any finding with that weight.

## Reporting

**Do not open a public issue.**

Use [GitHub's private vulnerability reporting](https://github.com/grpedroso/junto/security/advisories/new)
— the **Security** tab → **Report a vulnerability**.

> TODO: add an alternative contact email before the repo goes public.

We will respond within 7 days. If the problem is confirmed we will agree a
disclosure date together — we would rather fix it and publish what happened than
hide it.

## What we care about most

- Any way to read data belonging to a `user_id` that is not yours (an RLS failure)
- An EMA answer leaking into a log, crash report, telemetry or URL
- Exposure of the Supabase `service_role` key
- Any correlation that allows re-identifying a person from the anonymous data
- Any PII that made it into the schema without anyone noticing

## What we already know

- `EXPO_PUBLIC_SUPABASE_ANON_KEY` is public by construction. The protection is
  RLS, not the secrecy of the key. If a table's RLS is missing or loose, **that**
  is the vulnerability.
- The app has no password login. Identity is an anonymous UUID kept in
  `expo-secure-store`. Whoever holds the unlocked device holds the data — that is
  an accepted product decision, since requiring a password would drive users away.

## Out of scope

- Attacks requiring physical access to an unlocked device
- Social engineering against users
- Missing rate limits on a public Supabase endpoint with no demonstrated impact
