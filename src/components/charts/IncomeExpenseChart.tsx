import { useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';
import Text from '../ui/Text';
import ChartTooltip from './ChartTooltip';
import { niceScale, topRoundedRect } from './utils';
import { usePalette } from '@/hooks/useTheme';
import { COLORS } from '@/constants';
import { formatCompact } from '@/utils/format';

export interface BarDatum { label: string; income: number; expense: number }

const MARGIN = { top: 8, right: 4, left: 44, bottom: 26 };
const MAX_BAR = 28;
const BAR_GAP = 2;

/** Grouped income/expense bars. Touch (or drag across) a group to see exact amounts. */
export default function IncomeExpenseChart({ data, height = 256 }: { data: BarDatum[]; height?: number }) {
  const p = usePalette();
  const [width, setWidth] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const { top, ticks } = niceScale(Math.max(...data.map((d) => Math.max(d.income, d.expense)), 0));
  const y = (v: number) => MARGIN.top + plotH - (v / top) * plotH;
  const groupW = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(MAX_BAR, (groupW * 0.7 - BAR_GAP) / 2));
  const labelStep = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 46))));

  const pick = (x: number) => {
    if (!groupW) return;
    const i = Math.floor((x - MARGIN.left) / groupW);
    setSel(i >= 0 && i < data.length ? i : null);
  };

  const selected = sel !== null ? data[sel] : null;
  const tipLeft = sel !== null ? Math.min(Math.max(MARGIN.left + groupW * (sel + 0.5) - 80, 0), Math.max(0, width - 160)) : 0;

  return (
    <View>
      <View
        style={{ height }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onTouchStart={(e) => pick(e.nativeEvent.locationX)}
        onTouchMove={(e) => pick(e.nativeEvent.locationX)}
      >
        {width > 0 && (
          <Svg width={width} height={height}>
            {ticks.map((t) => (
              <Line key={`g${t}`} x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke={p.muted} strokeOpacity={0.15} strokeWidth={1} />
            ))}
            {ticks.map((t) => (
              <SvgText key={`t${t}`} x={MARGIN.left - 8} y={y(t) + 4} fontSize={11} fontFamily="Manrope_500Medium" fill={p.muted} fillOpacity={0.9} textAnchor="end">
                {formatCompact(t)}
              </SvgText>
            ))}
            {data.map((d, i) => {
              const cx = MARGIN.left + groupW * (i + 0.5);
              const x0 = cx - barW - BAR_GAP / 2;
              const dim = sel !== null && sel !== i ? 0.45 : 1;
              return (
                <G key={d.label + i}>
                  <Path d={topRoundedRect(x0, y(d.income), barW, y(0) - y(d.income), 4)} fill={COLORS.income} opacity={dim} />
                  <Path d={topRoundedRect(cx + BAR_GAP / 2, y(d.expense), barW, y(0) - y(d.expense), 4)} fill={COLORS.expense} opacity={dim} />
                  {i % labelStep === 0 && (
                    <SvgText x={cx} y={height - 8} fontSize={11} fontFamily="Manrope_500Medium" fill={p.muted} fillOpacity={0.9} textAnchor="middle">
                      {d.label}
                    </SvgText>
                  )}
                </G>
              );
            })}
            <Line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(0)} y2={y(0)} stroke={p.muted} strokeOpacity={0.25} strokeWidth={1} />
          </Svg>
        )}
        {selected && (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: tipLeft, width: 160 }}>
            <ChartTooltip
              label={selected.label}
              rows={[
                { name: 'Income', value: selected.income, color: COLORS.income },
                { name: 'Expense', value: selected.expense, color: COLORS.expense },
              ]}
            />
          </View>
        )}
      </View>

      <View className="mt-2 flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.income }} />
          <Text className="text-xs text-slate-600 dark:text-slate-300">Income</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.expense }} />
          <Text className="text-xs text-slate-600 dark:text-slate-300">Expense</Text>
        </View>
      </View>
    </View>
  );
}
