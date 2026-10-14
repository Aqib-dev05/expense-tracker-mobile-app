import { View } from 'react-native';
import Text from '../ui/Text';
import useFormat from '@/hooks/useFormat';
import { cardShadow } from '../ui/Card';

/** Same card as the web tooltip: bold label, then one coloured row per series. */
export default function ChartTooltip({ label, rows }: { label: string; rows: { name: string; value: number; color: string }[] }) {
  const fmt = useFormat();
  return (
    <View
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-800"
      style={[cardShadow, { elevation: 6, shadowOpacity: 0.15, shadowRadius: 8 }]}
      pointerEvents="none"
    >
      <Text className="mb-1 text-xs font-bold text-slate-900 dark:text-white">{label}</Text>
      {rows.map((r) => (
        <View key={r.name} className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
          <Text className="text-xs text-slate-600 dark:text-slate-300">{r.name}:</Text>
          <Text className="text-xs font-bold text-slate-900 dark:text-white">{fmt.money(r.value)}</Text>
        </View>
      ))}
    </View>
  );
}
