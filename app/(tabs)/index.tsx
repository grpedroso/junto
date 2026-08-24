import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Botao, Cartao, Rotulo, Tela, Texto, Titulo } from '@/components/base';
import { precisaTelaDeCuidado } from '@/domain/ema';
import { diasDesdeUltimaAposta, totalDeDiasSemAposta } from '@/domain/progresso';
import { useJunto } from '@/estado/useJunto';
import { CHAVES, gravar, ler } from '@/lib/storage';
import { t } from '@/i18n';

export default function Hoje() {
  const router = useRouter();
  const perfil = useJunto((e) => e.perfil);
  const emas = useJunto((e) => e.emas);

  const entradas = useMemo(
    () =>
      emas.map((e) => ({
        respondidaEm: new Date(e.respondidaEm),
        craving: e.craving,
        apostouDesdeUltima: e.apostouDesdeUltima,
        faixaValor: e.faixaValor,
      })),
    [emas]
  );

  const dias = diasDesdeUltimaAposta(entradas);
  const total = totalDeDiasSemAposta(entradas);
  const cuidado = precisaTelaDeCuidado(emas);
  const ultimaEma = emas[0]?.id;

  // Oferecer, nunca impor: a tela de cuidado nao bloqueia nem forca acao. E
  // aparece uma vez por resposta nova -- repetir a cada abertura viraria cobranca.
  useEffect(() => {
    if (!cuidado || !ultimaEma) return;
    void (async () => {
      const vista = await ler<string>(CHAVES.cuidadoVisto);
      if (vista === ultimaEma) return;
      await gravar(CHAVES.cuidadoVisto, ultimaEma);
      router.push('/cuidado');
    })();
  }, [cuidado, ultimaEma, router]);

  return (
    <Tela>
      <View className="flex-row items-center justify-between py-2">
        <Titulo>{t('onboarding.boas_vindas_titulo')}</Titulo>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ajustes.titulo')}
          onPress={() => router.push('/ajustes')}
          className="h-11 w-11 items-center justify-center active:opacity-60"
        >
          <Ionicons name="settings-outline" size={22} color="#5C6E68" />
        </Pressable>
      </View>

      <Cartao className="items-center gap-1 py-8">
        <Text className="text-6xl font-bold text-junto">{dias ?? 0}</Text>
        <Rotulo>
          {dias === 1 ? t('progresso.dias_sem_apostar_um') : t('progresso.dias_sem_apostar')}
        </Rotulo>
        {total > 0 && (
          <Text className="pt-2 text-center text-sm text-tinta-suave">
            {t('progresso.total_acumulado', { n: total })}
          </Text>
        )}
      </Cartao>

      <Botao titulo={t('ema.notificacao_titulo')} onPress={() => router.push('/ema')} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/sos')}
        className="min-h-16 items-center justify-center rounded-2xl border-2 border-junto bg-superficie active:opacity-70"
      >
        <Text className="text-xl font-bold text-junto">{t('sos.botao')}</Text>
        <Text className="text-sm text-tinta-suave">{t('sos.titulo')}</Text>
      </Pressable>

      {perfil?.baselinePgsi === null && (
        <Cartao>
          <Texto>{t('pgsi.intro')}</Texto>
          <Botao
            className="mt-3"
            variante="secundario"
            titulo={t('pgsi.titulo')}
            onPress={() => router.push('/(onboarding)/pgsi')}
          />
        </Cartao>
      )}
    </Tela>
  );
}
