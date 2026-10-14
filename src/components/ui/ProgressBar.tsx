import { View } from 'react-native';
import type { BudgetStatus } from '@/types';

const colors = { ok: 'bg-emerald-500', warning: 'bg-amber-500', exceeded: 'bg-rose-500' };

export default function ProgressBar({ percentage, status = 'ok', label }: { percentage: number; status?: BudgetStatus; label?: string }) {
  const pct = Math.max(0, Math.min(100, percentage));
  return (
    <View
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
    >
      <View className={`h-full rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
    </View>
  );
}
