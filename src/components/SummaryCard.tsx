import { View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react-native';
import Card from './ui/Card';
import Text from './ui/Text';
import { Icon } from './ui/Icon';
import { percent } from '@/utils/format';

const tones = {
  brand: { box: 'bg-brand-50 dark:bg-brand-500/15', icon: 'text-brand-600 dark:text-brand-300' },
  income: { box: 'bg-emerald-50 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-300' },
  expense: { box: 'bg-rose-50 dark:bg-rose-500/15', icon: 'text-rose-600 dark:text-rose-300' },
  savings: { box: 'bg-amber-50 dark:bg-amber-500/15', icon: 'text-amber-600 dark:text-amber-300' },
};

/** change: percentage vs previous period (null = no baseline). `lowerIsBetter` flips the colour (expenses). */
export default function SummaryCard({
  title, value, icon, tone = 'brand', change, lowerIsBetter = false, footnote, comparisonLabel = 'vs last month',
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  change?: number | null;
  lowerIsBetter?: boolean;
  footnote?: string;
  comparisonLabel?: string;
}) {
  const t = tones[tone];
  let delta = null;
  if (change !== undefined) {
    if (change === null) {
      delta = <Text className="text-xs text-slate-500 dark:text-slate-400">No data last month</Text>;
    } else if (change === 0) {
      delta = (
        <View className="flex-row items-center gap-1">
          <Icon as={Minus} size={14} className="text-slate-500 dark:text-slate-400" />
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">No change <Text className="text-xs text-slate-500 dark:text-slate-400">{comparisonLabel}</Text></Text>
        </View>
      );
    } else {
      const up = change > 0;
      const good = lowerIsBetter ? !up : up;
      const tint = good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
      delta = (
        <View className="flex-row items-center gap-1">
          <Icon as={up ? ArrowUpRight : ArrowDownRight} size={14} className={tint} />
          <Text className={`text-xs font-semibold ${tint}`}>
            {percent(change)} <Text className="text-xs text-slate-500 dark:text-slate-400">{comparisonLabel}</Text>
          </Text>
        </View>
      );
    }
  }

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</Text>
        <View className={`h-9 w-9 items-center justify-center rounded-xl ${t.box}`}>
          <Icon as={icon} size={18} className={t.icon} />
        </View>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</Text>
      <View className="min-h-[16px]">
        {delta ?? <Text className="text-xs text-slate-500 dark:text-slate-400">{footnote}</Text>}
      </View>
      {delta && footnote ? <Text className="-mt-1 text-xs text-slate-500 dark:text-slate-400">{footnote}</Text> : null}
    </Card>
  );
}
