import { Pressable, View } from 'react-native';
import Text from './ui/Text';
import CategoryIcon from './CategoryIcon';
import useFormat from '@/hooks/useFormat';
import type { Transaction } from '@/types';

function Amount({ tx, className = '' }: { tx: Transaction; className?: string }) {
  const fmt = useFormat();
  const income = tx.type === 'income';
  return (
    <Text className={`font-bold ${income ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} ${className}`}>
      {fmt.money(income ? tx.amount : -tx.amount, { sign: true })}
    </Text>
  );
}

/** Tappable transaction cards (the web mobile layout). Edit / delete live in the detail sheet. */
export default function TransactionList({ transactions, onView }: { transactions: Transaction[]; onView: (t: Transaction) => void }) {
  const fmt = useFormat();
  return (
    <View>
      {transactions.map((t, i) => (
        <Pressable
          key={t.id}
          accessibilityRole="button"
          accessibilityLabel={`${t.description || t.category}, ${t.type}`}
          onPress={() => onView(t)}
          className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-ink-800 ${i ? 'border-t border-slate-100 dark:border-ink-800' : ''}`}
        >
          <CategoryIcon category={t.category} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.description || t.category}</Text>
            <Text numberOfLines={1} className="text-xs text-slate-500 dark:text-slate-400">{t.category} • {t.paymentMethod}</Text>
            <Text className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{fmt.date(t.date)}</Text>
          </View>
          <Amount tx={t} className="text-sm" />
        </Pressable>
      ))}
    </View>
  );
}
