import { Pressable, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Text from './Text';
import { Icon } from './Icon';

function PageButton({ disabled, onPress, children, direction }: {
  disabled: boolean; onPress: () => void; children: string; direction: 'prev' | 'next';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`h-10 min-w-10 flex-row items-center justify-center rounded-xl border border-slate-300 px-3 dark:border-ink-700 ${disabled ? 'opacity-40' : 'active:bg-slate-100 dark:active:bg-ink-800'}`}
    >
      {direction === 'prev' ? <Icon as={ChevronLeft} size={16} className="mr-1 text-slate-600 dark:text-slate-300" /> : null}
      <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">{children}</Text>
      {direction === 'next' ? <Icon as={ChevronRight} size={16} className="ml-1 text-slate-600 dark:text-slate-300" /> : null}
    </Pressable>
  );
}

export default function Pagination({ page, totalPages, total, limit, onChange }: {
  page: number; totalPages: number; total: number; limit: number; onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <View accessibilityLabel="Pagination" className="items-center gap-3">
      <Text className="text-sm text-slate-500 dark:text-slate-400">
        Showing <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{from}–{to}</Text> of{' '}
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">{total}</Text>
      </Text>
      <View className="w-full flex-row items-center justify-between gap-2">
        <PageButton direction="prev" disabled={page <= 1} onPress={() => onChange(page - 1)}>Prev</PageButton>
        <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</Text>
        <PageButton direction="next" disabled={page >= totalPages} onPress={() => onChange(page + 1)}>Next</PageButton>
      </View>
    </View>
  );
}
