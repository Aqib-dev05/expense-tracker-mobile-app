import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react-native';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Text from './ui/Text';
import { LoadingState, ErrorState } from './ui/States';
import CategoryIcon from './CategoryIcon';
import useFormat from '@/hooks/useFormat';
import { getTransaction } from '@/services/transactionService';
import type { Transaction } from '@/types';

function Row({ label, first, children }: { label: string; first?: boolean; children: ReactNode }) {
  return (
    <View className={`flex-row items-start justify-between gap-4 py-3 ${first ? '' : 'border-t border-slate-100 dark:border-ink-800'}`}>
      <Text className="text-sm text-slate-500 dark:text-slate-400">{label}</Text>
      <View className="max-w-[65%] items-end">{children}</View>
    </View>
  );
}
const Value = ({ children }: { children: string }) => (
  <Text className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">{children}</Text>
);

/** Fetches the transaction by id so the sheet always shows the stored values (cached copy is shown instantly / offline). */
export default function TransactionDetailModal({ id, seed, onClose, onEdit, onDelete }: {
  id: string | null;
  /** The row that was tapped; shown while the fresh copy loads. */
  seed?: Transaction | null;
  onClose: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const fmt = useFormat();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransaction(id as string),
    enabled: Boolean(id),
    placeholderData: seed && seed.id === id ? seed : undefined,
  });
  const tx = data && data.id === id ? data : null;
  const isIncome = tx?.type === 'income';

  return (
    <Modal
      open={Boolean(id)}
      onClose={onClose}
      title="Transaction details"
      footer={
        tx ? (
          <View className="flex-col-reverse gap-2">
            <Button variant="secondary" icon={Trash2} onPress={() => onDelete(tx)}>Delete</Button>
            <Button icon={Pencil} onPress={() => onEdit(tx)}>Edit</Button>
          </View>
        ) : undefined
      }
    >
      {isLoading && !tx ? <LoadingState /> : null}
      {error && !tx ? <ErrorState compact message={(error as Error).message} onRetry={() => refetch()} /> : null}
      {tx ? (
        <View>
          <View className="mb-3 flex-row items-center gap-3">
            <CategoryIcon category={tx.category} size="lg" />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-base font-bold text-slate-900 dark:text-white">{tx.description || tx.category}</Text>
              <Text className={`text-2xl font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {fmt.money(isIncome ? tx.amount : -tx.amount, { sign: true })}
              </Text>
            </View>
          </View>
          <View>
            <Row label="Type" first><Badge tone={isIncome ? 'income' : 'expense'}>{isIncome ? 'Income' : 'Expense'}</Badge></Row>
            <Row label="Category"><Value>{tx.category}</Value></Row>
            <Row label="Payment method"><Value>{tx.paymentMethod}</Value></Row>
            <Row label="Date"><Value>{fmt.date(tx.date)}</Value></Row>
            {tx.notes ? <Row label="Notes"><Value>{tx.notes}</Value></Row> : null}
          </View>
        </View>
      ) : null}
    </Modal>
  );
}
