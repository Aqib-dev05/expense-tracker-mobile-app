import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Text from '../ui/Text';
import { categoryMeta } from '@/constants';
import useFormat from '@/hooks/useFormat';
import type { CategoryRow } from '@/types';

const SIZE = 208; // h-52 w-52
const OUTER = SIZE / 2;
const INNER = OUTER * 0.64;
const RADIUS = (OUTER + INNER) / 2;
const STROKE = OUTER - INNER;
const CIRC = 2 * Math.PI * RADIUS;
const GAP_DEG = 2; // Recharts paddingAngle

/** Donut with a legend. Tap a segment to see its category and amount in the centre. */
export default function CategoryDonut({ data, total, totalLabel = 'Total spent' }: {
  data: CategoryRow[]; total: number; totalLabel?: string;
}) {
  const fmt = useFormat();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState<number | null>(null);
  const wide = width >= 640;

  const sum = data.reduce((s, d) => s + d.total, 0) || 1;
  const gap = data.length > 1 ? (GAP_DEG / 360) * CIRC : 0;
  let offset = 0;
  const segments = data.map((d, i) => {
    const len = (d.total / sum) * CIRC;
    const seg = { i, color: categoryMeta(d.category).color, dash: Math.max(0.01, len - gap), start: offset };
    offset += len;
    return seg;
  });
  const sel = active !== null ? data[active] : null;

  return (
    <View className={`items-center gap-5 ${wide ? 'flex-row' : ''}`}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} origin={`${OUTER}, ${OUTER}`}>
            {segments.map((s) => (
              <Circle
                key={s.i}
                cx={OUTER}
                cy={OUTER}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
                strokeDashoffset={-s.start}
                opacity={active === null || active === s.i ? 1 : 0.35}
                onPress={() => setActive((a) => (a === s.i ? null : s.i))}
              />
            ))}
          </G>
        </Svg>
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center px-8">
          <Text className="text-xs text-slate-500 dark:text-slate-400">{sel ? sel.category : totalLabel}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit className="max-w-full text-base font-extrabold text-slate-900 dark:text-white">
            {fmt.money(sel ? sel.total : total)}
          </Text>
        </View>
      </View>

      <View className={`w-full min-w-0 gap-2.5 ${wide ? 'flex-1' : ''}`}>
        {data.slice(0, 7).map((d) => (
          <View key={d.category} className="flex-row items-center gap-3">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryMeta(d.category).color }} />
            <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{d.category}</Text>
            <Text className="text-sm font-bold text-slate-900 dark:text-white">{d.percentage}%</Text>
            {wide ? <Text className="w-24 text-right text-sm text-slate-500 dark:text-slate-400">{fmt.money(d.total)}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
