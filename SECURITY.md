# Política de segurança

Este app guarda dados de saúde de pessoas em situação de vulnerabilidade. Uma
falha aqui não expõe "dados de usuário" genéricos — expõe que alguém tem
problema com jogo, quanto apostou e em que estado emocional estava. Trate
qualquer achado com esse peso.

## Como reportar

**Não abra issue pública.**

Use o [Private Vulnerability Reporting do GitHub](https://github.com/grpedroso/junto/security/advisories/new)
— aba **Security** → **Report a vulnerability**.

> TODO: incluir um e-mail de contato alternativo antes de tornar o repo público.

Responderemos em até 7 dias. Se o problema for confirmado, combinamos uma data
de divulgação junto — preferimos corrigir e publicar o que aconteceu a esconder.

## O que nos interessa muito

- Qualquer forma de ler dados de um `user_id` que não seja o seu (falha de RLS)
- Vazamento de resposta de EMA em log, crash report, telemetria ou URL
- Exposição da `service_role` key do Supabase
- Correlação que permita reidentificar uma pessoa a partir dos dados anônimos
- Qualquer PII que tenha entrado no schema sem ninguém notar

## O que já sabemos

- O `EXPO_PUBLIC_SUPABASE_ANON_KEY` é público por construção. A proteção é a
  RLS, não o segredo da chave. Se a RLS de uma tabela estiver faltando ou
  frouxa, **isso** é a vulnerabilidade.
- O app não tem login com senha. A identidade é um UUID anônimo guardado em
  `expo-secure-store`. Quem tiver o aparelho desbloqueado tem os dados — isso é
  aceito por decisão de produto (exigir senha afastaria usuário).

## Fora de escopo

- Ataques que exigem acesso físico a aparelho desbloqueado
- Engenharia social contra usuários
- Falta de rate limit em endpoint público do Supabase sem impacto demonstrado
