# Junto

App de apoio a quem quer parar de apostar. A ideia é simples: chegar no momento
certo, com o plano que a própria pessoa escreveu antes, quando ela estava calma.

> **O Junto não é serviço de emergência.** Ninguém monitora as respostas em tempo
> real. Se você precisa falar com alguém agora: **CVV 188** (gratuito, 24h,
> sigiloso, também em [cvv.org.br](https://cvv.org.br)) ou **SAMU 192**.

## O que é

Uma [JITAI](https://doi.org/10.1007/s10899-023-10250-x) — *Just-In-Time Adaptive
Intervention*. Três vezes por dia o app pergunta seis coisas rápidas. Quando a
vontade está alta ou a sensação de conseguir resistir está baixa, ele mostra o
plano de enfrentamento que a pessoa criou para aquele gatilho.

Craving e autoeficácia momentâneos são os dois preditores que a literatura
confirma operarem em tempo real. Expectativa de ganho não prevê — por isso não
está no questionário.

## O que não é

- Não é bloqueador de sites ou apps (isso já é bem servido por Stopou, BetBlocker, Gamban)
- Não é cassino simulado
- Não faz triagem de risco suicida — oferece **rota para ajuda**, não avaliação
- Não julga, não usa linguagem de fracasso, não zera contador com culpa

## Estado

Em construção. Nada publicado ainda. O maior risco técnico — Android matar as
notificações em background — está sendo validado antes do resto: veja
[NOTIFICATIONS.md](NOTIFICATIONS.md).

## Rodar

Precisa de Node 20+, um aparelho Android físico e conta Expo.

```bash
npm install
cp .env.example .env      # preencha com as chaves do seu projeto Supabase
npx expo start
```

**Emulador não serve** para testar notificações, e o Expo Go também não: matar o
Expo Go mata o agendamento junto. Para qualquer teste de notificação use um build
de desenvolvimento:

```bash
npx eas build --platform android --profile development
```

### Testes

```bash
npm test
```

O que importa está em `src/domain/` — TypeScript puro, sem React e sem I/O. É
onde mora a regra de disparo e o escore do PGSI, e é o que dá para validar sem
subir o app.

## Estrutura

```
app/          rotas (expo-router)
src/
  domain/     regra de disparo, PGSI, jitter — puro, testável
  lib/        supabase, notificações, storage
  i18n/       todas as strings; zero texto hardcoded na UI
  components/
supabase/
  migrations/
```

## Contribuir

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) antes. A regra que não se quebra:
**qualquer mudança em texto que a pessoa lê num momento de vulnerabilidade
precisa de revisão clínica** — abra com a label `clinico`.

## Licença

[AGPL-3.0](LICENSE). A escolha é deliberada: impede que alguém pegue o código,
feche e monetize em cima de pessoas vulneráveis. O risco é real neste nicho.
