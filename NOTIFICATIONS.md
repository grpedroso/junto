# Notifications — Phase 0

Junto's biggest technical risk is not the app's code: it is Android killing
background notifications. If the EMAs do not arrive reliably on a real Brazilian
phone, the whole product stops existing.

**Nothing else should be built on top of an untested premise.** This document is
where the test result gets recorded.

## Status

🟡 **Spike written, on-device test pending.** Written 23/08/2026.

## The spike

It lives in `spike-notif/`, a second Expo project inside the repo.
`metro.config.js` blocks that folder — without it Metro finds two `package.json`
files and two copies of react-native, and the app bundle breaks.

```bash
cd spike-notif
npm install
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform android --profile preview
```

What it does:

- Asks for `POST_NOTIFICATIONS` (required on Android 13+)
- Creates the `ema` channel with `AndroidImportance.MAX`
- Schedules three daily notifications at 11:00 / 17:00 / 21:00
- Records every delivery in a persistent log (AsyncStorage) and shows the per-day count
- A 60-second test button, to check the channel without waiting all day
- A button that opens Android's battery optimisation screen directly
- Refuses to validate on an emulator (`Device.isDevice`)

### How it proves a notification arrived

This is the non-obvious part. With the app dead, **no listener runs** — not
`addNotificationReceivedListener`, not the response one. If the proof depended on
them, the test would be measuring the wrong thing.

The proof is `getPresentedNotificationsAsync()`: whatever is still in the tray
was actually delivered, and stays there even if the app was killed in between.
On open, the spike sweeps the tray and records anything it had not seen,
deduplicating by `identifier:date`.

**Consequence for the protocol:** during the test, **do not swipe notifications
out of the tray.** A dismissed notification disappears from the sweep and counts
as not delivered.

## ⚠️ Expo Go is no good

Testing this in Expo Go invalidates the result: the scheduling belongs to the
Expo Go process, so "closing the app" closes the host with it and the test
measures something else. Since SDK 53 expo-notifications also has functionality
removed in Expo Go — on Android the package cannot even be imported there, which
is why `src/lib/notifications.ts` requires it lazily and no-ops in Expo Go. The
app stays walkable; the notifications simply do not exist.

**Use the preview APK.** A development build works for the scheduling itself,
but it needs a Metro server on the same network to render anything — and the
protocol ends by opening the app on day 3, alone, to read the delivery log. The
preview APK embeds its bundle and opens standalone.

## Test protocol

Three consecutive days, without opening the app outside the check-in times.

- [ ] Preview APK installed on a **physical device** (not a development build)
- [ ] At least **2 different manufacturers** — ideally including Xiaomi or Samsung
- [ ] Notification permission granted (Android 13+ asks explicitly)
- [ ] "Schedule 3 daily" pressed exactly once, on day 1
- [ ] App closed by swiping away (removed from recents) on day 1
- [ ] Battery saver **on** — that is the real scenario, not the optimistic one
- [ ] Device rebooted at the end of day 2, without reopening the app afterwards
- [ ] No notification dismissed from the tray during the three days
- [ ] Check: open the app at the end of day 3 and read "Deliveries per day"

### Pass criterion

**9/9 delivered over 3 days, without opening the app.** A delay of up to 30
minutes counts as delivered — the product already plans for ±30min jitter, so
lateness does not hurt.

8/9 or fewer is a fail. Do not round up: one missed EMA per day is 33% of the data.

## Results matrix

Fill in as you test.

| Device | Android | Battery optimisation | Day 1 | Day 2 | Day 3 (post-reboot) | Verdict |
|---|---|---|---|---|---|---|
| _(fill in)_ | | | /3 | /3 | /3 | |
| _(fill in)_ | | | /3 | /3 | /3 | |

## What is already known about Android

**`POST_NOTIFICATIONS` (Android 13+, API 33).** A runtime permission. Without it
the app schedules and nothing appears, with no error at all. The spike asks on
first open.

**Exact alarms (Android 12+, API 31).** `SCHEDULE_EXACT_ALARM` now requires user
consent and, on the Play Store, a policy justification — `USE_EXACT_ALARM` is
restricted to alarm and calendar apps, and Junto does not qualify.

**Good news: Junto does not need exact alarms.** The product already wants ±30min
jitter so answering never becomes automatic. An inexact alarm lands inside that
window anyway. If the test passes without exact alarms, **remove
`SCHEDULE_EXACT_ALARM` from `app.json` before submitting** — one review headache
fewer. The spike declares it only so both modes can be compared.

**Reboot.** expo-notifications registers a `BOOT_COMPLETED` receiver and
reschedules on its own. That is exactly what day 3 of the protocol tests — never
trust it without measuring.

**Manufacturers.** Xiaomi (MIUI/HyperOS), Samsung, Oppo, Vivo and Huawei keep
their own lists of "optimised" apps that go beyond stock Android's Doze. The
typical symptom: works on day 1 and vanishes from day 2. See
[dontkillmyapp.com](https://dontkillmyapp.com) for the per-brand steps.

## What to ask the user during onboarding

_(Fill in after the test — only ask for what turns out to be necessary. Every
permission prompt is friction, and friction in onboarding is the project's
biggest dropout risk.)_

Candidates:

- Notification permission — unavoidable
- "Do not optimise battery for Junto" — the spike already has the button that opens the right screen
- Xiaomi: "Autostart" has to be enabled by hand
- Samsung: remove the app from "Sleeping apps"

Wording to be settled in the project's voice: explain **why**, never just ask.
Something like "so I can reach you at the right time, Android needs you to allow
this" — and a way to skip, because an app that gets stuck on a permission prompt
loses the person right there.

## If it fails: plan B

FCM plus a Supabase Edge Function on a cron.

- The server stores the push token and each UUID's schedule
- A cron fires hourly and sends to whoever has an EMA in that window
- More reliable (push arrives via Google Play Services, which no manufacturer kills)
- Costs more: a push token per device, expired-token handling, and the server now
  knows **when** each person is notified

**Decide here, not later.** Swapping the notification architecture with the app
finished means redoing the scheduling, the 30-minute follow-up and the offline path.
