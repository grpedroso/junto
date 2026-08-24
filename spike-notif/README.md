# spike-notif

App descartável da Fase 0 do Junto. Existe para responder uma pergunta só:
**o Android entrega notificação agendada em aparelho brasileiro real, com o app
fechado, por três dias seguidos?**

Não é parte do app. O `metro.config.js` do Junto bloqueia esta pasta.

```bash
npm install
npx eas build --platform android --profile development
```

Protocolo do teste, critério de aprovação e onde anotar o resultado:
[../NOTIFICATIONS.md](../NOTIFICATIONS.md).
