<!--
  This file stays in Brazilian Portuguese on purpose, unlike the rest of the
  docs. It is not developer documentation: it is the privacy policy shown to the
  people whose data it covers, linked from the app's Settings screen, and it has
  to satisfy the LGPD for a Brazilian audience. Translating it would make it
  unreadable to its actual readers.
-->

# Política de privacidade — Junto

**Rascunho.** Precisa de revisão antes de ir para uma URL pública (a Play Store
exige isso antes da submissão).

**Última atualização:** 23/08/2026

---

## Resumo em uma frase

O Junto não sabe quem você é. Nunca pedimos nome, e-mail, telefone ou CPF, e não
temos como descobrir.

## Quem é o responsável

Projeto sem fins lucrativos, código aberto sob AGPL-3.0.

> TODO: nome e contato do controlador de dados, exigido pela LGPD (Lei
> 13.709/2018, art. 41). Definir antes de publicar.

## O que coletamos

Quando você instala o app, geramos um **identificador aleatório (UUID)** no seu
aparelho. Ele é a sua conta. Não está ligado ao seu Google, ao seu telefone nem
a nenhum dado seu.

Ligado a esse identificador, guardamos:

| O quê | Exemplo |
|---|---|
| Respostas das avaliações | vontade 0-10, quanto consegue resistir 0-10, humor, gatilhos, contexto |
| Se apostou desde a última resposta | sim/não e a **faixa** de valor |
| Seus planos de enfrentamento | o texto que você mesmo escreveu |
| Quais planos funcionaram | contagem de quantas vezes ajudou |
| Seu fuso horário e os horários das avaliações | 11h / 17h / 21h |
| Seu resultado no PGSI | o escore do questionário inicial |
| Sua meta | parar ou reduzir |

## O que **não** coletamos

- Nome, e-mail, telefone, CPF, data de nascimento
- Localização — nenhuma, em momento nenhum
- Contatos, fotos, microfone, câmera
- Valor exato apostado (só a faixa — de propósito, para você responder com menos vergonha)
- Lista de apps instalados, histórico de navegação, sites visitados
- Identificadores de publicidade

## Por que coletamos

Só para o app funcionar: mostrar o plano certo no momento certo e te mostrar sua
própria evolução. **Não vendemos nada, não compartilhamos com ninguém e não há
publicidade no app.**

## Onde ficam

Num banco Postgres do Supabase, na região de São Paulo. Cada registro tem uma
regra no banco (*Row Level Security*) que só deixa o seu identificador ler os
seus próprios dados.

O app também guarda uma cópia no próprio aparelho, para funcionar sem internet —
o botão SOS e a tela de Ajuda precisam funcionar mesmo sem sinal.

## Por quanto tempo

> TODO: definir a política de retenção. Proposta: apagar automaticamente após
> 12 meses sem nenhum acesso, avisando antes se houver como.

## Apagar tudo

Dentro do app, em Ajustes → **Apagar meus dados**. Apaga tudo, na hora, sem
pergunta de retenção e sem "tem certeza?" além da confirmação. Não guardamos
cópia.

Como não temos como te identificar, se você desinstalar o app e perder o
aparelho, não conseguimos recuperar nem apagar sob demanda esses dados — o
identificador ficava só no seu aparelho.

## Seus direitos (LGPD)

Acesso, correção, portabilidade, eliminação e informação sobre compartilhamento.
Como não há PII, o exercício desses direitos acontece dentro do próprio app, com
o identificador do seu aparelho.

## Menores de idade

O app não é destinado a menores de 18 anos.

## Relatórios de erro

Usamos relatório de falha para consertar bugs, configurado para **não** enviar
dado pessoal nem conteúdo de resposta. Se algum dia uma resposta de EMA aparecer
num relatório de erro, isso é um bug de segurança — veja [SECURITY.md](SECURITY.md).

## Isto não é serviço de emergência

Ninguém lê suas respostas em tempo real. O app não monitora ninguém e não
substitui atendimento profissional. Se precisar falar com alguém agora:
**CVV 188**, gratuito e sigiloso, 24 horas.

## Mudanças

Alterações relevantes serão avisadas dentro do app antes de valerem.
