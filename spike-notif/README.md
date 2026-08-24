# spike-notif

Junto's disposable Phase 0 app. It exists to answer one question:
**does Android deliver a scheduled notification on a real Brazilian phone, with
the app closed, for three days running?**

Not part of the app. Junto's `metro.config.js` blocks this folder.

```bash
npm install
npx eas build --platform android --profile development
```

Test protocol, pass criterion and where to record the result:
[../NOTIFICATIONS.md](../NOTIFICATIONS.md).
