# spike-notif

Junto's disposable Phase 0 app. It exists to answer one question:
**does Android deliver a scheduled notification on a real Brazilian phone, with
the app closed, for three days running?**

Not part of the app. Junto's `metro.config.js` blocks this folder, and this
folder has its own `metro.config.js` so it does not inherit the app's.

**It schedules exactly what the app schedules** — 21 days of one-shot `DATE`
alarms with +-30 min of jitter, same channel importance, and no
`SCHEDULE_EXACT_ALARM`. A probe that scheduled anything else would answer a
question nobody asked.

```bash
npm install
npx eas-cli login                                          # a free Expo account
npx eas-cli init                                           # writes extra.eas.projectId into app.json
npx eas-cli build --platform android --profile preview
```

Build the **preview** profile, not the development one. The protocol ends by
opening the app on day 3 to read the delivery log, and a development build
renders nothing without a Metro server on the same network. The preview APK
carries its own bundle, so it opens standalone three days later.

Test protocol, pass criterion and where to record the result:
[../NOTIFICATIONS.md](../NOTIFICATIONS.md).
