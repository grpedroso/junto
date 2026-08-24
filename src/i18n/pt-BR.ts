/**
 * Todas as strings do app moram aqui. Nenhuma na UI -- e a regra que permite
 * traduzir sem reescrever tela, e permite o revisor clinico ler tudo o que a
 * pessoa vai ler num arquivo so.
 *
 * Tom de voz: direto, brasileiro, informal, do lado da pessoa. Nunca clinico,
 * professoral, motivacional-generico ou infantilizado. Nunca linguagem de
 * fracasso. Ver a tabela de regras em CONTRIBUTING.md.
 */
export default {
  comum: {
    continuar: 'Continuar',
    voltar: 'Voltar',
    pular: 'Pular',
    salvar: 'Salvar',
    cancelar: 'Cancelar',
    pronto: 'Pronto',
    agora_nao: 'Agora não',
  },

  abas: {
    hoje: 'Hoje',
    planos: 'Planos',
    progresso: 'Progresso',
    ajuda: 'Ajuda',
  },

  onboarding: {
    boas_vindas_titulo: 'Junto',
    boas_vindas_texto:
      'Um app pra te dar uma mão na hora que a vontade de apostar aperta. Sem julgamento, sem sermão.',
    o_que_e_titulo: 'Como funciona',
    o_que_e_texto:
      'Três vezes por dia eu te faço seis perguntas rápidas. Leva vinte segundos. Quando a coisa apertar, eu te mostro o plano que você mesmo escreveu antes, com a cabeça fria.',
    o_que_nao_e_titulo: 'O que eu não faço',
    o_que_nao_e_texto:
      'Não bloqueio site nem app. Não sou médico e não substituo atendimento. E ninguém do outro lado fica lendo suas respostas em tempo real — nem eu, nem ninguém.',
    privacidade_titulo: 'Ninguém sabe quem você é',
    privacidade_texto:
      'Sem nome, sem e-mail, sem telefone. Sua conta é um número aleatório criado aqui no seu aparelho. Se quiser apagar tudo, é um botão.',
    meta_titulo: 'O que você quer?',
    meta_parar: 'Parar de apostar',
    meta_reduzir: 'Apostar menos',
    horarios_titulo: 'Que horas eu te chamo?',
    horarios_texto:
      'Vou variar uns trinta minutos pra não virar automático. Você pode mudar depois.',
    planos_titulo: 'Seus primeiros planos',
    planos_texto:
      'Escolha pelo menos dois. Dá pra editar do seu jeito — quanto mais parecido com a sua vida, melhor funciona.',
    planos_faltando: 'Escolhe mais um pra gente começar.',
    permissao_titulo: 'Preciso poder te chamar',
    permissao_texto:
      'Sem a permissão de notificação eu não consigo aparecer na hora certa. É o único jeito de isso funcionar.',
    permissao_botao: 'Liberar notificação',
    bateria_titulo: 'Mais uma coisa',
    bateria_texto:
      'O Android às vezes desliga apps pra economizar bateria, e aí eu sumo. Libera o Junto nessa tela que abre agora.',
    bateria_botao: 'Abrir a configuração',
    fim_titulo: 'Tô junto',
    fim_texto: 'Te chamo mais tarde. Até lá, fica tranquilo.',
  },

  ema: {
    notificacao_titulo: 'E aí, como tá?',
    notificacao_corpo: '20 segundos, 6 perguntas.',
    depois: 'Respondo depois',
    depois_confirmado: 'Beleza, te chamo daqui a uma hora.',
    depois_esgotado: 'Essa é a última — depois disso, só na próxima.',
    perguntas: {
      craving: 'Vontade de apostar agora?',
      autoeficacia: 'Se aparecesse a chance agora, quanto você consegue resistir?',
      humor: 'Como você tá?',
      gatilhos: 'Tem algo puxando?',
      contexto: 'Onde tá?',
      apostou: 'Apostou desde a última vez?',
      faixa: 'Mais ou menos quanto?',
    },
    escala: { craving_min: 'nenhuma', craving_max: 'muita', ae_min: 'nada', ae_max: 'consigo' },
    sim: 'Apostei',
    nao: 'Não apostei',
    obrigado: 'Valeu. Até mais tarde.',
    obrigado_apostou: 'Anotado. Sem drama — bora seguir.',
  },

  humor: {
    tranquilo: 'tranquilo',
    ansioso: 'ansioso',
    triste: 'triste',
    irritado: 'irritado',
    animado: 'animado',
    entediado: 'entediado',
  },

  gatilho: {
    dinheiro_apertado: 'dinheiro apertado',
    propaganda: 'propaganda',
    amigos_apostando: 'amigos apostando',
    jogo_passando: 'jogo passando',
    tedio: 'tédio',
    briga_estresse: 'briga ou estresse',
    nada: 'nada',
  },

  contexto: {
    casa: 'casa',
    trabalho: 'trabalho',
    rua: 'rua',
    sozinho: 'sozinho',
    acompanhado: 'acompanhado',
  },

  faixa_valor: {
    ate_50: 'até R$ 50',
    '50_200': 'R$ 50 a 200',
    '200_500': 'R$ 200 a 500',
    mais_500: 'mais de R$ 500',
  },

  planos: {
    titulo: 'Meus planos',
    vazio: 'Você ainda não tem plano nenhum. Bora escrever o primeiro?',
    novo: 'Novo plano',
    condicao_rotulo: 'Quando...',
    acao_rotulo: '...eu vou',
    condicao_dica: 'ex: bater vontade de apostar',
    acao_dica: 'ex: sair pra caminhar dez minutos',
    adotar: 'Usar esse',
    editar: 'Editar',
    apagar: 'Apagar',
    apagar_confirma: 'Apagar esse plano?',
    funcionou_n_vezes: 'funcionou %{n} de %{total}',
    ainda_sem_uso: 'ainda não usado',
    sugestoes: 'Sugestões pra adotar',
    categoria: {
      substituicao: 'Fazer outra coisa',
      social: 'Falar com alguém',
      fisico: 'Mexer o corpo',
      cognitivo: 'Ganhar tempo',
      ambiental: 'Mudar o ambiente',
    },
    biblioteca: {
      banho_gelado: { condicao: 'bater vontade', acao: 'tomar um banho gelado' },
      caminhar_10min: { condicao: 'bater vontade', acao: 'sair pra caminhar dez minutos' },
      lavar_louca: { condicao: 'bater vontade', acao: 'lavar a louça' },
      jogo_no_radio: {
        condicao: 'o jogo tiver passando',
        acao: 'assistir com o som no rádio, sem o celular na mão',
      },
      mandar_mensagem: { condicao: 'bater vontade', acao: 'mandar mensagem pra alguém' },
      ligar_de_noite: {
        condicao: 'estiver sozinho à noite',
        acao: 'ligar pra alguém em vez de abrir o celular',
      },
      flexoes: { condicao: 'a ansiedade subir', acao: 'fazer vinte flexões' },
      respiracao_478: { condicao: 'a ansiedade subir', acao: 'respirar 4-7-8 por um minuto' },
      lembrar_ultima_vez: {
        condicao: 'pensar "dessa vez eu recupero"',
        acao: 'lembrar da última vez que pensei isso',
      },
      esperar_15min: {
        condicao: 'bater vontade',
        acao: 'esperar quinze minutos antes de decidir',
      },
      bloquear_remetente: {
        condicao: 'receber propaganda de bet',
        acao: 'bloquear o remetente na hora',
      },
      separar_contas: {
        condicao: 'o dinheiro entrar',
        acao: 'separar o valor das contas antes de qualquer coisa',
      },
    },
  },

  intervencao: {
    titulo: 'Tá puxado agora, né?',
    subtitulo: 'Você escreveu isso aqui pra esse momento:',
    quando: 'Quando %{condicao},',
    entao: 'eu vou %{acao}.',
    sem_plano: 'Você ainda não tem um plano pra isso. Que tal esperar quinze minutos antes de decidir?',
    botao_fazer: 'Bora fazer',
    botao_outro: 'Me mostra outro',
    followup_titulo: 'E aí, conseguiu?',
    followup_notificacao: 'Conseguiu segurar?',
    followup_sim: 'Consegui',
    followup_nao: 'Acabei apostando',
    followup_resposta_sim: 'Boa. Isso conta.',
    followup_resposta_nao: 'Aconteceu. Bora de novo.',
  },

  sos: {
    botao: 'SOS',
    titulo: 'Tô aqui',
    subtitulo: 'Escolhe o que dá pra fazer agora:',
    respiracao: 'Respirar comigo',
    respiracao_inspira: 'Puxa o ar',
    respiracao_segura: 'Segura',
    respiracao_solta: 'Solta devagar',
    meus_planos: 'Meus planos',
    falar_com_alguem: 'Falar com alguém',
  },

  ajuda: {
    titulo: 'Ajuda',
    precisa_agora: 'Preciso de ajuda de verdade',
    cvv_nome: 'CVV — 188',
    cvv_desc: 'Gratuito, 24 horas, sigiloso. Também tem chat.',
    samu_nome: 'SAMU — 192',
    samu_desc: 'Emergência médica.',
    caps_nome: 'CAPS',
    caps_desc: 'Atendimento gratuito pelo SUS, perto de você.',
    autoexclusao_nome: 'Autoexclusão gov.br',
    autoexclusao_desc: 'Bloqueia seu CPF nas bets reguladas.',
    ja_nome: 'Jogadores Anônimos',
    ja_desc: 'Grupos presenciais e online, em todo o Brasil.',
    bloqueadores_titulo: 'Bloquear sites e apps',
    bloqueadores_desc:
      'O Junto não bloqueia nada — isso outros apps já fazem bem. Vale usar junto.',
    ligar: 'Ligar',
    abrir: 'Abrir',
  },

  cuidado: {
    titulo: 'Semana pesada, hein?',
    texto:
      'Pelas suas últimas respostas, os dias andam difíceis. Conversar com alguém ajuda mais do que parece — e não precisa ser uma emergência pra valer a pena.',
    lembrete: 'Você não precisa fazer nada agora. Isso aqui fica aqui.',
    fechar: 'Fechar',
  },

  progresso: {
    titulo: 'Progresso',
    dias_sem_apostar: 'dias sem apostar',
    dias_sem_apostar_um: 'dia sem apostar',
    total_acumulado: 'no total, %{n} dias limpos desde que você começou',
    craving_titulo: 'Sua vontade ao longo do tempo',
    craving_vazio: 'Responde mais algumas avaliações que eu te mostro a curva.',
    dinheiro_titulo: 'Dinheiro que ficou com você',
    dinheiro_valor: 'R$ %{valor}',
    dinheiro_nota: 'Estimativa pelo seu próprio ritmo das primeiras semanas.',
    planos_titulo: 'O que mais funcionou pra você',
    respondidas: '%{n} de %{total} avaliações respondidas',
  },

  pgsi: {
    titulo: 'Um retrato de onde você está',
    intro:
      'Nove perguntas sobre os últimos doze meses. Não é diagnóstico e não vai pra lugar nenhum — serve pra você comparar daqui a um mês.',
    referencia: 'Pensando nos últimos 12 meses...',
    // TODO clinico: esta e uma redacao provisoria. Antes de qualquer uso real,
    // substituir pelo texto exato da adaptacao brasileira publicada na Revista
    // de Saude Publica 2026 (DOI 10.11606/s1518-8787.2026060007368).
    itens: {
      apostou_mais_que_podia: 'Você apostou mais do que podia perder?',
      precisou_apostar_mais:
        'Você precisou apostar valores maiores pra sentir a mesma empolgação?',
      voltou_para_recuperar: 'Você voltou outro dia pra tentar recuperar o que perdeu?',
      vendeu_ou_pediu_emprestado: 'Você vendeu algo ou pegou dinheiro emprestado pra apostar?',
      sentiu_que_tem_problema: 'Você sentiu que talvez tenha um problema com apostas?',
      causou_problema_de_saude:
        'Apostar te causou algum problema de saúde, incluindo estresse ou ansiedade?',
      foi_criticado:
        'Alguém criticou suas apostas ou disse que você tem problema com isso, tendo razão ou não?',
      causou_problema_financeiro:
        'Apostar causou algum problema financeiro pra você ou pra sua casa?',
      sentiu_culpa: 'Você se sentiu culpado pelo jeito que aposta ou pelo que acontece quando aposta?',
    },
    opcoes: ['Nunca', 'Às vezes', 'Na maioria das vezes', 'Quase sempre'],
    faixa: {
      sem_risco: 'sem sinal de risco',
      baixo: 'risco baixo',
      moderado: 'risco moderado',
      problematico: 'sinais de problema com jogo',
    },
    resultado: 'Seu retrato hoje: %{faixa}.',
    resultado_nota:
      'Isso não é diagnóstico. É um ponto de partida pra você olhar daqui a trinta dias.',
    reaplicar: 'Já faz um mês. Bora refazer aquelas nove perguntas?',
  },

  ajustes: {
    titulo: 'Ajustes',
    horarios: 'Horários das avaliações',
    apagar_dados: 'Apagar meus dados',
    apagar_confirma: 'Apaga tudo mesmo? Não tem como voltar atrás.',
    apagar_feito: 'Apagado. Tudo mesmo.',
    privacidade: 'Privacidade',
    sobre: 'Sobre o Junto',
  },

  erros: {
    sem_rede: 'Sem internet agora. Guardei aqui e mando depois.',
    generico: 'Deu ruim aqui do meu lado. Tenta de novo?',
  },
} as const;
