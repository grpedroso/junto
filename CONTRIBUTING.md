# Como contribuir

Obrigado por olhar. Este é um projeto sem fins lucrativos, de dev solo, e ajuda
é bem-vinda — principalmente de quem entende de dependência de jogo, de quem já
passou por isso, e de quem sabe testar Android de verdade.

## A regra que não se quebra: revisão clínica

**Qualquer PR que mude texto que a pessoa lê num momento de vulnerabilidade não
é mergeado sem revisão clínica.** Isso inclui:

- Textos da tela de cuidado (`app/cuidado.tsx`)
- Textos da tela de intervenção e do follow-up
- Perguntas e opções da EMA
- Itens e faixas do PGSI
- O limiar da regra de disparo (`src/domain/ema.ts`)
- Qualquer copy sobre recaída, progresso ou streak

Marque o PR com a label `clinico`. Se não tiver certeza se o seu caso entra,
marque mesmo assim — o custo de marcar à toa é zero.

### Regras de linguagem, inegociáveis

| ❌ Nunca | ✅ Em vez disso |
|---|---|
| "Você recaiu" | "Aconteceu. Bora de novo." |
| "Você falhou em atingir sua meta" | "Semana difícil. Isso acontece." |
| "Parabéns pelos seus 7 dias de abstinência!" | "7 dias. Tá firme." |
| "Detectamos comportamento de risco" | "Parece que hoje tá puxado" |

- **Nunca** mencionar métodos de autolesão — nem no formato "remova o acesso a X"
- **Nunca** alarme visual (vermelho, ícone de perigo) na tela de cuidado
- Recaída é **recomeço**: o contador registra e segue, não pune
- Tela de cuidado nunca bloqueia o app nem força ação

Tom: direto, brasileiro, informal, do lado da pessoa. Não é clínico, não é
professoral, não é motivacional-genérico, não é infantilizado.

## Privacidade não é negociável

O app é anônimo por construção. Um PR **não pode**:

- Adicionar coluna ou campo com nome, e-mail, telefone, CPF ou qualquer PII
- Guardar valor exato de aposta — só faixa (`amount_band`)
- Adicionar geolocalização
- Criar tabela sem RLS
- Mandar resposta de EMA para log, crash report ou serviço de terceiros

Marque com a label `privacidade` qualquer PR que toque em dado de usuário.

## Fluxo

1. Abra uma issue antes de mexer em algo grande — evita trabalho jogado fora
2. Branch a partir de `main`
3. `npm test` passando
4. `npx tsc --noEmit` limpo
5. Nenhuma string nova hardcoded na UI — tudo em `src/i18n/pt-BR.ts`
6. PR pequeno e descrito em português

## Onde a lógica mora

`src/domain/` é TypeScript puro: sem React, sem I/O, sem `fetch`. É a regra
clínica isolada do resto para poder ser testada e auditada. Se você precisa de
rede ou de um hook do React lá dentro, o código provavelmente está no lugar
errado.

## O que ajuda muito

- Testar em aparelho de fabricante agressivo com bateria (Xiaomi, Samsung, Motorola) e relatar em [NOTIFICATIONS.md](NOTIFICATIONS.md)
- Revisão de acessibilidade (contraste, leitor de tela)
- Revisão de texto por quem trabalha com CAPS-AD ou pesquisa em jogo patológico
- Tradução do PGSI-BR com a redação exata da adaptação publicada

## Segurança

Vulnerabilidade não vai em issue pública. Veja [SECURITY.md](SECURITY.md).
