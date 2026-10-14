import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import ChartTooltip from './ChartTooltip';
import { monotonePath, niceScale } from './utils';
import { usePalette } from '@/hooks/useTheme';
import { COLORS } from '@/constants';
import { formatCompact } from '@/utils/format';

export interface AreaDatum { label: string; expense: number }

const MARGIN = { top: 8, right: 8, left: 44, bottom: 26 };

/** Smooth area chart of spending over time. Touch or drag to inspect a point. */
export default function SpendingAreaChart({ data, height = 256 }: { data: AreaDatum[]; height?: number }) {
  const p = usePalette();
  const [width, setWidth] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const { top, ticks } = niceScale(Math.max(...data.map((d) => d.expense), 0));
  const y = (v: number) => MARGIN.top + plotH - (v / top) * plotH;
  const n = data.length;
  const x = (i: number) => MARGIN.left + (n > 1 ? (plotW * i) / (n - 1) : plotW / 2);
  const pts = data.map((d, i) => ({ x: x(i), y: y(d.expense) }));
  const line = monotonePath(pts);
  const area = n ? `${line} L${pts[n - 1].x},${y(0)} L${pts[0].x},${y(0)} Z` : '';
  const labelStep = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 46))));

  const pick = (px: number) => {
    if (!n || !plotW) return;
    const i = n > 1 ? Math.round(((px - MARGIN.left) / plotW) * (n - 1)) : 0;
    setSel(Math.min(n - 1, Math.max(0, i)));
  };
  const tipLeft = sel !== null ? Math.min(Math.max(x(sel) - 80, 0), Math.max(0, width - 160)) : 0;

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onTouchStart={(e) => pick(e.nativeEvent.locationX)}
      onTouchMove={(e) => pick(e.nativeEvent.locationX)}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.brand} stopOpacity={0.25} />
              <Stop offset="1" stopColor={COLORS.brand} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {ticks.map((t) => (
            <Line key={`g${t}`} x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke={p.muted} strokeOpacity={0.15} strokeWidth={1} />
          ))}
          {ticks.map((t) => (
            <SvgText key={`t${t}`} x={MARGIN.left - 8} y={y(t) + 4} fontSize={11} fontFamily="Manrope_500Medium" fill={p.muted} fillOpacity={0.9} textAnchor="end">
              {formatCompact(t)}
            </SvgText>
          ))}
          <Path d={area} fill="url(#spendFill)" />
          <Path d={line} fill="none" stroke={COLORS.brand} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) =>
            i % labelStep === 0 ? (
              <SvgText key={`x${i}`} x={x(i)} y={height - 8} fontSize={11} fontFamily="Manrope_500Medium" fill={p.muted} fillOpacity={0.9} textAnchor="middle">
                {d.label}
              </SvgText>
            ) : null
          )}
          {sel !== null && (
            <>
              <Line x1={x(sel)} x2={x(sel)} y1={MARGIN.top} y2={y(0)} stroke={p.muted} strokeOpacity={0.3} strokeDasharray="3 3" />
              <Circle cx={x(sel)} cy={y(data[sel].expense)} r={5} fill={COLORS.brand} stroke={p.surface} strokeWidth={2} />
            </>
          )}
        </Svg>
      )}
      {sel !== null && (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: tipLeft, width: 160 }}>
          <ChartTooltip label={data[sel].label} rows={[{ name: 'Expenses', value: data[sel].expense, color: COLORS.brand }]} />
        </View>
      )}
    </View>
  );
}
