# Notificações — Fase 0

O maior risco técnico do Junto não é o código do app: é o Android matar as
notificações em background. Se as EMAs não chegarem de forma confiável em
aparelho brasileiro real, o produto inteiro deixa de existir.

**Nada do resto do app deve ser construído em cima de uma premissa não testada.**
Este documento é onde o resultado do teste fica registrado.

## Status

🟡 **Spike escrito, teste em aparelho pendente.** Escrito em 23/08/2026.

## O spike

Fica em `../spike-notif` — fora deste repositório, de propósito: é descartável e
um segundo projeto Expo aninhado quebraria o Metro (colisão de haste map).

```bash
cd ../spike-notif
npx eas build --platform android --profile development
```

O que ele faz:

- Pede `POST_NOTIFICATIONS` (obrigatório no Android 13+)
- Cria o canal `ema` com `AndroidImportance.MAX`
- Agenda três notificações diárias em 11h / 17h / 21h
- Registra cada entrega num log persistente (AsyncStorage) e mostra a contagem por dia
- Botão de teste em 60s, para conferir o canal sem esperar o dia inteiro
- Botão que abre direto a tela de otimização de bateria do Android
- Recusa-se a validar em emulador (`Device.isDevice`)

### Como ele prova que a notificação chegou

Este é o ponto não óbvio. Com o app morto, **nenhum listener roda** — nem
`addNotificationReceivedListener`, nem o de resposta. Se a prova dependesse
deles, o teste mediria a coisa errada.

A prova é `getPresentedNotificationsAsync()`: o que ainda está na bandeja foi
entregue de fato, e continua lá mesmo que o app tenha sido morto no intervalo.
Ao abrir, o spike varre a bandeja e registra o que ainda não tinha visto,
deduplicando por `identifier:date`.

**Consequência para o protocolo:** durante o teste, **não deslize as notificações
para fora da bandeja.** Uma notificação dispensada some da varredura e conta como
não entregue.

## ⚠️ Expo Go não serve

Testar isso no Expo Go invalida o resultado: o agendamento pertence ao processo
do Expo Go, então "fechar o app" fecha o host junto e o teste mede outra coisa.
Desde o SDK 53 o expo-notifications também tem funcionalidade removida no Expo Go.

**Use development build ou o APK de preview. Sempre.**

## Protocolo do teste

Três dias corridos, sem abrir o app fora dos horários de conferência.

- [ ] Build de desenvolvimento instalado em **aparelho físico**
- [ ] Pelo menos **2 fabricantes** diferentes — idealmente incluindo Xiaomi ou Samsung
- [ ] Permissão de notificação concedida (Android 13+ pede explicitamente)
- [ ] "Agendar 3 diárias" pressionado uma única vez, no dia 1
- [ ] App fechado com swipe away (removido dos recentes) no dia 1
- [ ] Economia de bateria **ligada** — é o cenário real, não o otimista
- [ ] Aparelho reiniciado no fim do dia 2, sem reabrir o app depois
- [ ] Nenhuma notificação dispensada da bandeja durante os 3 dias
- [ ] Conferência: abrir o app no fim do dia 3 e ler "Entregas por dia"

### Critério de aprovação

**9/9 entregues em 3 dias, sem abrir o app.** Atraso de até 30 minutos conta
como entregue — o produto já prevê jitter de ±30min, então atraso não atrapalha.

8/9 ou menos = reprovado. Não arredonde: uma EMA perdida por dia é 33% do dado.

## Matriz de resultados

Preencher conforme testar.

| Aparelho | Android | Otimização de bateria | Dia 1 | Dia 2 | Dia 3 (pós-reboot) | Veredito |
|---|---|---|---|---|---|---|
| _(preencher)_ | | | /3 | /3 | /3 | |
| _(preencher)_ | | | /3 | /3 | /3 | |

## O que já se sabe sobre o Android

**`POST_NOTIFICATIONS` (Android 13+, API 33).** Permissão em runtime. Sem ela o
app agenda e nada aparece, sem erro nenhum. O spike pede na primeira abertura.

**Alarmes exatos (Android 12+, API 31).** `SCHEDULE_EXACT_ALARM` passou a exigir
concessão do usuário e, na Play Store, justificativa de política — `USE_EXACT_ALARM`
é restrito a app de alarme/calendário e o Junto não se qualifica.

**Boa notícia: o Junto não precisa de alarme exato.** O produto já quer jitter de
±30min para a resposta não virar automática. Alarme inexato entrega dentro dessa
janela de qualquer jeito. Se o teste passar sem alarme exato, **remova
`SCHEDULE_EXACT_ALARM` do `app.json` antes de submeter** — é uma dor de cabeça
de revisão a menos. O spike o declara só para permitir comparar os dois modos.

**Reboot.** O expo-notifications registra um receiver de `BOOT_COMPLETED` e
reagenda sozinho. Isso é exatamente o que o dia 3 do protocolo testa — nunca
confie sem medir.

**Fabricantes.** Xiaomi (MIUI/HyperOS), Samsung, Oppo, Vivo e Huawei mantêm
listas próprias de apps "otimizados" que vão além do Doze do Android puro. O
sintoma típico: funciona no dia 1 e some a partir do dia 2. Ver
[dontkillmyapp.com](https://dontkillmyapp.com) para o passo a passo por marca.

## O que pedir ao usuário no onboarding

_(Preencher depois do teste — só peça o que se mostrar necessário. Cada pedido
de permissão é atrito, e atrito no onboarding é o maior risco de dropout do
projeto.)_

Candidatos:

- Permissão de notificação — inevitável
- "Não otimizar bateria para o Junto" — o spike já tem o botão que abre a tela certa
- Xiaomi: "Início automático" (Autostart) precisa ser ligado manualmente
- Samsung: tirar o app de "Apps em suspensão"

Redação a definir com o tom do projeto: explicar **por que**, nunca só pedir.
Algo como "pra eu conseguir te chamar na hora certa, o Android precisa que você
libere isso aqui" — e um jeito de pular, porque um app que trava no pedido de
permissão perde a pessoa ali.

## Se reprovar: plano B

FCM + Supabase Edge Function com cron.

- O servidor guarda o token de push e os horários de cada UUID
- Um cron dispara de hora em hora e envia para quem tem EMA naquela janela
- Mais confiável (o push chega pelo Google Play Services, que nenhum fabricante mata)
- Custa mais: exige token de push por aparelho, tratamento de token expirado, e
  o servidor passa a saber **quando** cada pessoa é notificada

**Decidir aqui, não depois.** Trocar a arquitetura de notificação com o app
pronto significa refazer o agendamento, o follow-up de 30 minutos e o offline.
