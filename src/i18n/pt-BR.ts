/**
 * Every string in the app lives here. None in the UI -- that is the rule that
 * lets us translate without touching a screen, and lets the clinical reviewer
 * read everything the person will read in a single file.
 *
 * Keys are English, values are Brazilian Portuguese. The values are the product
 * and stay in pt-BR: this app is for Brazilians.
 *
 * Voice: direct, Brazilian, informal, on the person's side. Never clinical,
 * professorial, generically motivational or patronising. Never the language of
 * failure. See the rules table in CONTRIBUTING.md.
 */
export default {
  common: {
    continue: 'Continuar',
    back: 'Voltar',
    skip: 'Pular',
    save: 'Salvar',
    cancel: 'Cancelar',
    done: 'Pronto',
    not_now: 'Agora não',
  },

  tabs: {
    today: 'Hoje',
    plans: 'Planos',
    progress: 'Progresso',
    help: 'Ajuda',
  },

  onboarding: {
    welcome_title: 'Junto',
    welcome_text:
      'Um app pra te dar uma mão na hora que a vontade de apostar aperta. Sem julgamento, sem sermão.',
    what_it_is_title: 'Como funciona',
    what_it_is_text:
      'Três vezes por dia eu te faço seis perguntas rápidas. Leva vinte segundos. Quando a coisa apertar, eu te mostro o plano que você mesmo escreveu antes, com a cabeça fria.',
    privacy_title: 'Ninguém sabe quem você é',
    privacy_text:
      'Sem nome, sem e-mail, sem telefone. Sua conta é um número aleatório criado aqui no seu aparelho. Ninguém fica lendo suas respostas — nem eu, nem ninguém. Se quiser apagar tudo, é um botão.',
    goal_title: 'O que você quer?',
    goal_quit: 'Parar de apostar',
    goal_reduce: 'Apostar menos',
    times_title: 'Que horas eu te chamo?',
    times_text:
      'Vou variar uns trinta minutos pra não virar automático. Você pode mudar depois.',
    plans_title: 'Seus primeiros planos',
    plans_text:
      'Escolha pelo menos dois. Dá pra editar do seu jeito — quanto mais parecido com a sua vida, melhor funciona.',
    plans_missing: 'Escolhe mais um pra gente começar.',
    permission_title: 'Preciso poder te chamar',
    permission_text:
      'Sem a permissão de notificação eu não consigo aparecer na hora certa. É o único jeito de isso funcionar.',
    permission_button: 'Liberar notificação',
    battery_title: 'Mais uma coisa',
    battery_text:
      'O Android às vezes desliga apps pra economizar bateria, e aí eu sumo. Libera o Junto nessa tela que abre agora.',
    battery_button: 'Abrir a configuração',
    done_title: 'Tô junto',
    done_text: 'Te chamo mais tarde. Até lá, fica tranquilo.',
  },

  ema: {
    notification_title: 'E aí, como tá?',
    notification_body: '20 segundos, 6 perguntas.',
    later: 'Respondo depois',
    finish: 'Pronto',
    later_confirmed: 'Beleza, te chamo daqui a uma hora.',
    later_spent: 'Essa é a última — depois disso, só na próxima.',
    questions: {
      craving: 'Vontade de apostar agora?',
      self_efficacy: 'Se aparecesse a chance agora, quanto você consegue resistir?',
      mood: 'Como você tá?',
      triggers: 'Tem algo puxando?',
      context: 'Onde tá?',
      gambled: 'Apostou desde a última vez?',
      band: 'Mais ou menos quanto?',
    },
    scale: {
      craving_min: 'nenhuma',
      craving_max: 'muita',
      se_min: 'nada',
      se_max: 'consigo',
    },
    yes: 'Apostei',
    no: 'Não apostei',
    thanks: 'Valeu. Até mais tarde.',
    thanks_gambled: 'Anotado. Sem drama — bora seguir.',
  },

  mood: {
    calm: 'tranquilo',
    anxious: 'ansioso',
    sad: 'triste',
    irritated: 'irritado',
    upbeat: 'animado',
    bored: 'entediado',
  },

  trigger: {
    money_tight: 'dinheiro apertado',
    ads: 'propaganda',
    friends_betting: 'amigos apostando',
    game_on: 'jogo passando',
    boredom: 'tédio',
    conflict_stress: 'briga ou estresse',
    nothing: 'nada',
  },

  context: {
    home: 'casa',
    work: 'trabalho',
    out: 'rua',
    alone: 'sozinho',
    with_others: 'acompanhado',
  },

  amount_band: {
    upto_50: 'até R$ 50',
    from_50_200: 'R$ 50 a 200',
    from_200_500: 'R$ 200 a 500',
    over_500: 'mais de R$ 500',
  },

  plans: {
    title: 'Meus planos',
    empty: 'Você ainda não tem plano nenhum. Bora escrever o primeiro?',
    new: 'Novo plano',
    condition_label: 'Quando...',
    action_label: '...eu vou',
    condition_hint: 'ex: bater vontade de apostar',
    action_hint: 'ex: sair pra caminhar dez minutos',
    adopt: 'Usar esse',
    edit: 'Editar',
    delete: 'Apagar',
    delete_confirm: 'Apagar esse plano?',
    worked_n_times: 'funcionou %{n} de %{total}',
    never_used: 'ainda não usado',
    suggestions: 'Sugestões pra adotar',
    category: {
      substitution: 'Fazer outra coisa',
      social: 'Falar com alguém',
      physical: 'Mexer o corpo',
      cognitive: 'Ganhar tempo',
      environmental: 'Mudar o ambiente',
    },
    library: {
      cold_shower: { condition: 'bater vontade', action: 'tomar um banho gelado' },
      walk_10min: { condition: 'bater vontade', action: 'sair pra caminhar dez minutos' },
      wash_dishes: { condition: 'bater vontade', action: 'lavar a louça' },
      game_on_radio: {
        condition: 'o jogo tiver passando',
        action: 'assistir com o som no rádio, sem o celular na mão',
      },
      text_someone: { condition: 'bater vontade', action: 'mandar mensagem pra alguém' },
      call_at_night: {
        condition: 'estiver sozinho à noite',
        action: 'ligar pra alguém em vez de abrir o celular',
      },
      pushups: { condition: 'a ansiedade subir', action: 'fazer vinte flexões' },
      breathing_478: { condition: 'a ansiedade subir', action: 'respirar 4-7-8 por um minuto' },
      recall_last_time: {
        condition: 'pensar "dessa vez eu recupero"',
        action: 'lembrar da última vez que pensei isso',
      },
      wait_15min: {
        condition: 'bater vontade',
        action: 'esperar quinze minutos antes de decidir',
      },
      block_sender: {
        condition: 'receber propaganda de bet',
        action: 'bloquear o remetente na hora',
      },
      set_aside_bills: {
        condition: 'o dinheiro entrar',
        action: 'separar o valor das contas antes de qualquer coisa',
      },
    },
  },

  intervention: {
    title: 'Tá puxado agora, né?',
    subtitle: 'Você escreveu isso aqui pra esse momento:',
    when: 'Quando %{condition},',
    then: 'eu vou %{action}.',
    no_plan:
      'Você ainda não tem um plano pra isso. Que tal esperar quinze minutos antes de decidir?',
    do_it: 'Bora fazer',
    show_another: 'Me mostra outro',
    followup_title: 'E aí, conseguiu?',
    followup_notification: 'Conseguiu segurar?',
    followup_yes: 'Consegui',
    followup_no: 'Acabei apostando',
    followup_reply_yes: 'Boa. Isso conta.',
    followup_reply_no: 'Aconteceu. Bora de novo.',
  },

  sos: {
    button: 'SOS',
    title: 'Tô aqui',
    subtitle: 'Escolhe o que dá pra fazer agora:',
    breathing: 'Respirar comigo',
    breathing_in: 'Puxa o ar',
    breathing_hold: 'Segura',
    breathing_out: 'Solta devagar',
    my_plans: 'Meus planos',
    talk_to_someone: 'Falar com alguém',
  },

  help: {
    title: 'Ajuda',
    need_now: 'Preciso de ajuda de verdade',
    cvv_name: 'CVV — 188',
    cvv_desc: 'Gratuito, 24 horas, sigiloso. Também tem chat.',
    samu_name: 'SAMU — 192',
    samu_desc: 'Emergência médica.',
    caps_name: 'CAPS',
    caps_desc: 'Atendimento gratuito pelo SUS, perto de você.',
    selfexclusion_name: 'Autoexclusão gov.br',
    selfexclusion_desc: 'Bloqueia seu CPF nas bets reguladas.',
    ga_name: 'Jogadores Anônimos',
    ga_desc: 'Grupos presenciais e online, em todo o Brasil.',
    not_treatment:
      'O Junto não é atendimento e não substitui profissional. Ele te dá uma mão no dia a dia; quem cuida de verdade são as pessoas aqui embaixo.',
    blockers_title: 'Bloquear sites e apps',
    blockers_desc:
      'O Junto não bloqueia nada — isso outros apps já fazem bem. Vale usar junto.',
    call: 'Ligar',
    open: 'Abrir',
  },

  care: {
    title: 'Semana pesada, hein?',
    text:
      'Pelas suas últimas respostas, os dias andam difíceis. Conversar com alguém ajuda mais do que parece — e não precisa ser uma emergência pra valer a pena.',
    reminder: 'Você não precisa fazer nada agora. Isso aqui fica aqui.',
    close: 'Fechar',
  },

  progress: {
    title: 'Progresso',
    days_without_betting: 'dias sem apostar',
    days_without_betting_one: 'dia sem apostar',
    running_total: 'no total, %{n} dias limpos desde que você começou',
    craving_title: 'Sua vontade ao longo do tempo',
    craving_empty: 'Responde mais algumas avaliações que eu te mostro a curva.',
    money_title: 'Dinheiro que ficou com você',
    money_value: 'R$ %{value}',
    money_note: 'Estimativa pelo seu próprio ritmo das primeiras semanas.',
    plans_title: 'O que mais funcionou pra você',
    answered: '%{n} de %{total} avaliações respondidas',
  },

  pgsi: {
    title: 'Um retrato de onde você está',
    intro:
      'Nove perguntas sobre os últimos doze meses. Não é diagnóstico e não vai pra lugar nenhum — serve pra você comparar daqui a um mês.',
    reference: 'Pensando nos últimos 12 meses...',
    // CLINICAL TODO: this wording is provisional. Before any real use, replace
    // it with the exact text of the Brazilian adaptation published in Revista de
    // Saude Publica 2026 (DOI 10.11606/s1518-8787.2026060007368).
    items: {
      bet_more_than_afford: 'Você apostou mais do que podia perder?',
      needed_larger_bets:
        'Você precisou apostar valores maiores pra sentir a mesma empolgação?',
      chased_losses: 'Você voltou outro dia pra tentar recuperar o que perdeu?',
      borrowed_or_sold: 'Você vendeu algo ou pegou dinheiro emprestado pra apostar?',
      felt_problem: 'Você sentiu que talvez tenha um problema com apostas?',
      health_problems:
        'Apostar te causou algum problema de saúde, incluindo estresse ou ansiedade?',
      was_criticized:
        'Alguém criticou suas apostas ou disse que você tem problema com isso, tendo razão ou não?',
      financial_problems:
        'Apostar causou algum problema financeiro pra você ou pra sua casa?',
      felt_guilty:
        'Você se sentiu culpado pelo jeito que aposta ou pelo que acontece quando aposta?',
    },
    options: ['Nunca', 'Às vezes', 'Na maioria das vezes', 'Quase sempre'],
    band: {
      none: 'sem sinal de risco',
      low: 'risco baixo',
      moderate: 'risco moderado',
      problem: 'sinais de problema com jogo',
    },
    result: 'Seu retrato hoje: %{band}.',
    result_note:
      'Isso não é diagnóstico. É um ponto de partida pra você olhar daqui a trinta dias.',
    retake: 'Já faz um mês. Bora refazer aquelas nove perguntas?',
  },

  settings: {
    title: 'Ajustes',
    times: 'Horários das avaliações',
    delete_data: 'Apagar meus dados',
    delete_confirm: 'Apaga tudo mesmo? Não tem como voltar atrás.',
    delete_done: 'Apagado. Tudo mesmo.',
    privacy: 'Privacidade',
    about: 'Sobre o Junto',
  },

  errors: {
    offline: 'Sem internet agora. Guardei aqui e mando depois.',
    generic: 'Deu ruim aqui do meu lado. Tenta de novo?',
  },
} as const;
