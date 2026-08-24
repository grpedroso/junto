import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { ESCALA } from '@/domain/ema';
import type { PontoSemanal } from '@/domain/progresso';

const L = 220;
const A = 120;
const MARGEM = { esq: 22, dir: 8, topo: 10, base: 22 };

export function CurvaCraving({ pontos }: { pontos: PontoSemanal[] }) {
  const largura = L - MARGEM.esq - MARGEM.dir;
  const altura = A - MARGEM.topo - MARGEM.base;

  const x = (i: number) =>
    MARGEM.esq + (pontos.length === 1 ? largura / 2 : (i / (pontos.length - 1)) * largura);
  const y = (v: number) => MARGEM.topo + altura - (v / ESCALA.max) * altura;

  const caminho = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.media)}`).join(' ');

  return (
    <View className="items-center">
      <Svg width="100%" height={A} viewBox={`0 0 ${L} ${A}`}>
        {[0, 5, 10].map((v) => (
          <Line
            key={v}
            x1={MARGEM.esq}
            y1={y(v)}
            x2={L - MARGEM.dir}
            y2={y(v)}
            stroke="#E2E8E5"
            strokeWidth={1}
          />
        ))}
        {[0, 5, 10].map((v) => (
          <SvgText key={v} x={4} y={y(v) + 3} fontSize={8} fill="#5C6E68">
            {v}
          </SvgText>
        ))}

        {pontos.length > 1 && (
          <Path d={caminho} stroke="#1F6F5C" strokeWidth={2.5} fill="none" />
        )}
        {pontos.map((p, i) => (
          <Circle key={p.semana} cx={x(i)} cy={y(p.media)} r={3.5} fill="#1F6F5C" />
        ))}
      </Svg>
    </View>
  );
}
