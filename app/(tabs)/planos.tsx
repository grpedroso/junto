import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Botao, Cartao, Chips, Rotulo, Tela, Texto, Titulo } from '@/components/base';
import { BIBLIOTECA } from '@/domain/plans';
import type { CategoriaPlano, Plano } from '@/domain/tipos';
import { useJunto } from '@/estado/useJunto';
import ptBR from '@/i18n/pt-BR';
import { t } from '@/i18n';

const CATEGORIAS: CategoriaPlano[] = [
  'substituicao',
  'social',
  'fisico',
  'cognitivo',
  'ambiental',
];

export default function Planos() {
  const planos = useJunto((e) => e.planos);
  const criarPlano = useJunto((e) => e.criarPlano);
  const editarPlano = useJunto((e) => e.editarPlano);
  const apagarPlano = useJunto((e) => e.apagarPlano);
  const adotarModelo = useJunto((e) => e.adotarModelo);
  const [editando, setEditando] = useState<Plano | 'novo' | null>(null);

  const adotados = new Set(
    planos.map((p) => `${p.condicao}|${p.acao}`)
  );
  const sugestoes = BIBLIOTECA.filter((m) => {
    const texto = ptBR.planos.biblioteca[m.id as keyof typeof ptBR.planos.biblioteca];
    return !adotados.has(`${texto.condicao}|${texto.acao}`);
  });

  if (editando) {
    return (
      <Editor
        plano={editando === 'novo' ? null : editando}
        onCancelar={() => setEditando(null)}
        onSalvar={async (campos) => {
          if (editando === 'novo') await criarPlano({ ...campos, gatilhos: [] });
          else await editarPlano(editando.id, campos);
          setEditando(null);
        }}
      />
    );
  }

  return (
    <Tela>
      <Titulo className="py-2">{t('planos.titulo')}</Titulo>

      {planos.length === 0 && <Texto>{t('planos.vazio')}</Texto>}

      {planos.map((p) => (
        <Cartao key={p.id} className="gap-3">
          <Text className="text-base text-tinta">
            Quando <Text className="font-semibold">{p.condicao}</Text>, eu vou{' '}
            <Text className="font-semibold">{p.acao}</Text>.
          </Text>
          <View className="flex-row items-center justify-between">
            <Rotulo>
              {p.vezesMostrado === 0
                ? t('planos.ainda_sem_uso')
                : t('planos.funcionou_n_vezes', { n: p.vezesFuncionou, total: p.vezesMostrado })}
            </Rotulo>
            <View className="flex-row gap-4">
              <Link rotulo={t('planos.editar')} onPress={() => setEditando(p)} />
              <Link
                rotulo={t('planos.apagar')}
                onPress={() =>
                  Alert.alert(t('planos.apagar_confirma'), undefined, [
                    { text: t('comum.cancelar'), style: 'cancel' },
                    { text: t('planos.apagar'), onPress: () => void apagarPlano(p.id) },
                  ])
                }
              />
            </View>
          </View>
        </Cartao>
      ))}

      <Botao titulo={t('planos.novo')} onPress={() => setEditando('novo')} />

      {sugestoes.length > 0 && (
        <View className="gap-2 pt-4">
          <Titulo className="text-lg">{t('planos.sugestoes')}</Titulo>
          {sugestoes.map((m) => {
            const texto = ptBR.planos.biblioteca[m.id as keyof typeof ptBR.planos.biblioteca];
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                onPress={() => void adotarModelo(m.id)}
                className="rounded-2xl border border-borda bg-superficie p-4 active:opacity-70"
              >
                <Text className="text-base text-tinta">
                  Quando {texto.condicao}, eu vou {texto.acao}.
                </Text>
                <Rotulo className="pt-1 text-junto">{t('planos.adotar')}</Rotulo>
              </Pressable>
            );
          })}
        </View>
      )}
    </Tela>
  );
}

const Link = ({ rotulo, onPress }: { rotulo: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-60">
    <Text className="text-sm font-semibold text-junto">{rotulo}</Text>
  </Pressable>
);

type CamposEditaveis = { condicao: string; acao: string; categoria: CategoriaPlano };

function Editor({
  plano,
  onSalvar,
  onCancelar,
}: {
  plano: Plano | null;
  onSalvar: (campos: CamposEditaveis) => void;
  onCancelar: () => void;
}) {
  const [condicao, setCondicao] = useState(plano?.condicao ?? '');
  const [acao, setAcao] = useState(plano?.acao ?? '');
  const [categoria, setCategoria] = useState<CategoriaPlano>(plano?.categoria ?? 'substituicao');

  const valido = condicao.trim().length > 0 && acao.trim().length > 0;

  return (
    <Tela>
      <Titulo className="py-2">{plano ? t('planos.editar') : t('planos.novo')}</Titulo>

      <View className="gap-2">
        <Rotulo>{t('planos.condicao_rotulo')}</Rotulo>
        <TextInput
          value={condicao}
          onChangeText={setCondicao}
          placeholder={t('planos.condicao_dica')}
          placeholderTextColor="#8FA39D"
          multiline
          className="min-h-14 rounded-2xl border border-borda bg-superficie px-4 py-3 text-base text-tinta"
        />
      </View>

      <View className="gap-2">
        <Rotulo>{t('planos.acao_rotulo')}</Rotulo>
        <TextInput
          value={acao}
          onChangeText={setAcao}
          placeholder={t('planos.acao_dica')}
          placeholderTextColor="#8FA39D"
          multiline
          className="min-h-14 rounded-2xl border border-borda bg-superficie px-4 py-3 text-base text-tinta"
        />
      </View>

      <Chips
        itens={CATEGORIAS.map((c) => ({ valor: c, rotulo: t(`planos.categoria.${c}`) }))}
        selecionados={[categoria]}
        onToggle={(v) => setCategoria(v as CategoriaPlano)}
      />

      <Botao
        titulo={t('comum.salvar')}
        desabilitado={!valido}
        onPress={() => onSalvar({ condicao: condicao.trim(), acao: acao.trim(), categoria })}
      />
      <Botao titulo={t('comum.cancelar')} variante="discreto" onPress={onCancelar} />
    </Tela>
  );
}
