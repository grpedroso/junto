# Junto — notas para quem for mexer no código

Expo mudou muito. Leia os docs da versão exata antes de escrever código:
https://docs.expo.dev/versions/v57.0.0/

## O que é

App de apoio a quem quer parar de apostar. Uma JITAI: três avaliações rápidas
por dia (EMA), e quando craving está alto ou autoeficácia baixa, mostra o plano
de enfrentamento que a própria pessoa escreveu antes, com a cabeça fria.

Android primeiro, pt-BR, sem fins lucrativos, AGPL-3.0.

## Regras que não se quebram

**Revisão clínica.** Texto que a pessoa lê em momento de vulnerabilidade não
muda sem revisor clínico. Ver a lista em [CONTRIBUTING.md](CONTRIBUTING.md).

**Zero PII.** Nenhuma coluna, campo ou log com nome, e-mail, telefone ou CPF.
Valor de aposta só em faixa. Zero geolocalização. RLS em toda tabela.

**Zero string na UI.** Tudo em `src/i18n/pt-BR.ts`. É o que permite ao revisor
clínico ler num arquivo só tudo o que o usuário vai ler.

**Sem vermelho.** Nenhuma tela deste app deve parecer alarme — a paleta em
`tailwind.config.js` não tem vermelho de propósito.

**`src/domain/` é TypeScript puro.** Sem React, sem I/O, sem `fetch`. É a regra
clínica isolada para poder ser testada e auditada. Se precisou de hook ou rede
lá dentro, o código está no lugar errado.

**Offline-first.** Toda escrita cai na fila local (`src/lib/storage.ts`) antes
de tentar o servidor. A pessoa pode estar sem dados no momento de crise; o SOS e
a tela de Ajuda funcionam 100% offline, com os telefones fixos no código.

## Onde está o quê

```
app/                     rotas (expo-router)
  (onboarding)/          apresentação → meta → horários → planos → PGSI → permissão
  (tabs)/                hoje, planos, progresso, ajuda
  ema.tsx                as 6 perguntas
  intervencao/[id].tsx   o plano + o follow-up de 30min
  sos.tsx, cuidado.tsx, ajustes.tsx
src/
  domain/                ema.ts (regra de disparo), scoring.ts (PGSI), plans.ts, progresso.ts
  lib/                   supabase, notifications, storage (fila), sessao (auth anônima)
  estado/useJunto.ts     zustand; toda escrita passa por aqui
  components/            base.tsx, Escala, Recursos, CurvaCraving, QuestionarioPgsi
  i18n/pt-BR.ts          TODAS as strings
supabase/migrations/     schema + RLS + delete_my_data()
```

## Comandos

```bash
npm start                # metro
npm test                 # 70 testes, domínio + agendamento
npm run typecheck
npx expo export --platform android   # confere que o bundle fecha
```

## Armadilhas

**Expo Go não serve para testar notificação.** Matar o Expo Go mata o
agendamento junto. Use development build. Ver [NOTIFICATIONS.md](NOTIFICATIONS.md).

**O jitter exige data concreta.** O gatilho diário do Android é hora fixa. Por
isso `agendarEmas` agenda 21 dias de datas concretas e reagenda a cada abertura
— e por isso o agendamento morre se o app nunca mais for aberto.

**Não use `toISOString` para agrupar por dia.** No Brasil, uma EMA das 21h cai
no dia seguinte em UTC e o contador de dias sai errado. `src/domain/progresso.ts`
usa componentes locais.

**Estado do React não está atualizado no mesmo handler.** `app/ema.tsx` passa
`apostouAgora` por parâmetro justamente por isso.

**A fila é filtrada por id, não sobrescrita.** Sobrescrever com "o que sobrou"
perde escritas que chegaram durante o envio.

**A anon key do Supabase é pública.** Quem protege os dados é a RLS. Se uma
tabela ficar sem policy, isso é a vulnerabilidade — não o vazamento da chave.

## O que ainda não existe

- Projeto Supabase criado (a migration está escrita, nunca rodou)
- `src/types/database.ts` é escrito à mão; vira gerado quando o projeto existir
- Resultado da Fase 0 (teste de notificação em aparelho real)
- Revisor clínico
- Texto exato dos 9 itens do PGSI-BR — o que está lá é provisório
