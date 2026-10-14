import { Pressable, View } from 'react-native';
import { AlertOctagon, AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-react-native';
import Card from './ui/Card';
import Badge, { badgeTextClass } from './ui/Badge';
import Text from './ui/Text';
import { Icon } from './ui/Icon';
import ProgressBar from './ui/ProgressBar';
import CategoryIcon from './CategoryIcon';
import useFormat from '@/hooks/useFormat';
import type { Budget } from '@/types';

const STATUS = {
  ok: { tone: 'income', label: 'On track', icon: CheckCircle2 },
  warning: { tone: 'warning', label: 'Nearing limit', icon: AlertTriangle },
  exceeded: { tone: 'expense', label: 'Exceeded', icon: AlertOctagon },
} as const;

export default function BudgetCard({ budget, onEdit, onDelete }: {
  budget: Budget; onEdit?: (b: Budget) => void; onDelete?: (b: Budget) => void;
}) {
  const fmt = useFormat();
  const s = STATUS[budget.status];
  const over = budget.remaining < 0;
  const pctColor =
    budget.status === 'exceeded' ? 'text-rose-600 dark:text-rose-400'
    : budget.status === 'warning' ? 'text-amber-600 dark:text-amber-400'
    : 'text-slate-700 dark:text-slate-200';

  return (
    <Card className="gap-4">
      <View className="flex-row items-start gap-3">
        <CategoryIcon category={budget.category} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-bold text-slate-900 dark:text-white">{budget.category}</Text>
          <Text className="text-xs capitalize text-slate-500 dark:text-slate-400">
            {budget.period} · {fmt.date(budget.startDate)} – {fmt.date(budget.endDate)}
          </Text>
        </View>
        <Badge tone={s.tone} icon={<Icon as={s.icon} size={12} className={badgeTextClass(s.tone)} />}>{s.label}</Badge>
      </View>

      <View>
        <View className="mb-2 flex-row items-baseline justify-between gap-2">
          <Text className="flex-1 text-sm text-slate-500 dark:text-slate-400">
            <Text className="text-lg font-extrabold text-slate-900 dark:text-white">{fmt.money(budget.spent)}</Text>
            {' '}of {fmt.money(budget.amount)}
          </Text>
          <Text className={`text-sm font-bold ${pctColor}`}>{Math.round(budget.percentage)}%</Text>
        </View>
        <ProgressBar percentage={budget.percentage} status={budget.status} label={`${budget.category} budget used`} />
        <Text className={`mt-2 text-xs font-medium ${over ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {over ? `Over budget by ${fmt.money(-budget.remaining)}` : `${fmt.money(budget.remaining)} remaining`}
        </Text>
      </View>

      {onEdit || onDelete ? (
        <View className="-mb-1 flex-row justify-end gap-1 border-t border-slate-100 pt-3 dark:border-ink-800">
          {onEdit ? (
            <Pressable onPress={() => onEdit(budget)} accessibilityRole="button" className="h-9 flex-row items-center gap-1.5 rounded-lg px-3 active:bg-slate-100 dark:active:bg-ink-800">
              <Icon as={Pencil} size={16} className="text-slate-600 dark:text-slate-300" />
              <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">Edit</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={() => onDelete(budget)} accessibilityRole="button" className="h-9 flex-row items-center gap-1.5 rounded-lg px-3 active:bg-rose-50 dark:active:bg-rose-500/10">
              <Icon as={Trash2} size={16} className="text-rose-600 dark:text-rose-400" />
              <Text className="text-sm font-semibold text-rose-600 dark:text-rose-400">Delete</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
