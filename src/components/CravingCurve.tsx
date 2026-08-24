import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { SCALE } from '@/domain/ema';
import type { WeeklyPoint } from '@/domain/progress';

const W = 220;
const H = 120;
const MARGIN = { left: 22, right: 8, top: 10, bottom: 22 };

export function CravingCurve({ points }: { points: WeeklyPoint[] }) {
  const width = W - MARGIN.left - MARGIN.right;
  const height = H - MARGIN.top - MARGIN.bottom;

  const x = (i: number) =>
    MARGIN.left + (points.length === 1 ? width / 2 : (i / (points.length - 1)) * width);
  const y = (v: number) => MARGIN.top + height - (v / SCALE.max) * height;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.average)}`).join(' ');

  return (
    <View className="items-center">
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 5, 10].map((v) => (
          <Line
            key={v}
            x1={MARGIN.left}
            y1={y(v)}
            x2={W - MARGIN.right}
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

        {points.length > 1 && <Path d={path} stroke="#1F6F5C" strokeWidth={2.5} fill="none" />}
        {points.map((p, i) => (
          <Circle key={p.week} cx={x(i)} cy={y(p.average)} r={3.5} fill="#1F6F5C" />
        ))}
      </Svg>
    </View>
  );
}
