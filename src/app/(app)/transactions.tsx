import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Filter, Plus, Receipt, Search, SearchX, X } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Select from '@/components/ui/Select';
import DateField from '@/components/ui/DateField';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/ui/States';
import TransactionList from '@/components/TransactionList';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import useDebounce from '@/hooks/useDebounce';
import { ALL_CATEGORIES, PAYMENT_METHODS, SORT_OPTIONS } from '@/constants';
import { deleteTransaction, listTransactions } from '@/services/transactionService';
import { useAppData } from '@/store/AppDataContext';
import { useToast } from '@/store/ToastContext';
import type { Transaction } from '@/types';

const LIMIT = 10;
const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];
const INITIAL = { search: '', type: '', category: '', paymentMethod: '', startDate: '', endDate: '', sort: 'newest' };

export default function Transactions() {
  const toast = useToast();
  const { invalidate, openTransactionForm } = useAppData();
  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(filters.search, 400);
  const dateError = filters.startDate && filters.endDate && filters.startDate > filters.endDate ? 'Start date must be before end date' : undefined;
  const params = { ...filters, search: debouncedSearch.trim(), page, limit: LIMIT };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => listTransactions(params),
    enabled: !dateError,
    placeholderData: keepPreviousData, // keep the old page on screen while filters / pages change
  });

  // Clamp the page if the result set shrank (e.g. after deleting the last item on the last page)
  useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const setFilter = (key: keyof typeof INITIAL, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const activeCount = (['type', 'category', 'paymentMethod', 'startDate', 'endDate'] as const).filter((k) => filters[k]).length + (filters.search ? 1 : 0);
  const clearAll = () => { setFilters((f) => ({ ...INITIAL, sort: f.sort })); setPage(1); };

  const del = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => { toast.success('Transaction deleted'); setToDelete(null); setViewTx(null); invalidate(); },
    onError: (e) => toast.error((e as Error).message),
  });

  const transactions = data?.transactions;
  const refreshing = isFetching && Boolean(data);

  return (
    <Screen>
      <PageHeader
        title="Transactions"
        subtitle="Search, filter and manage everything you’ve earned and spent."
        actions={<Button icon={Plus} onPress={() => openTransactionForm()}>Add transaction</Button>}
      />

      <Card className="mb-4 gap-4">
        <Input leftIcon={Search} returnKeyType="search" placeholder="Search description or category" value={filters.search} onChangeText={(v) => setFilter('search', v)} />
        <View className="flex-row gap-3">
          <Select wrapperClassName="flex-1" title="Sort" options={SORT_OPTIONS} value={filters.sort} onChange={(v) => setFilter('sort', v)} />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showFilters }}
            onPress={() => setShowFilters((s) => !s)}
            className="h-11 flex-row items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 active:bg-slate-50 dark:border-ink-700 dark:bg-ink-800 dark:active:bg-ink-700"
          >
            <Icon as={Filter} size={16} className="text-slate-700 dark:text-slate-200" />
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filters</Text>
            {activeCount > 0 ? (
              <View className="h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1">
                <Text className="text-[11px] text-white">{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {showFilters ? (
          <View className="gap-4">
            <View className="flex-row gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-ink-800" accessibilityRole="tablist">
              {TYPE_TABS.map((t) => {
                const active = filters.type === t.value;
                return (
                  <Pressable
                    key={t.label}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter('type', t.value)}
                    className={`h-10 flex-1 items-center justify-center rounded-lg ${active ? 'bg-white dark:bg-ink-700' : ''}`}
                    style={active ? { elevation: 1 } : undefined}
                  >
                    <Text className={`text-sm font-semibold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Select title="Category" placeholder="All categories" options={ALL_CATEGORIES} value={filters.category} onChange={(v) => setFilter('category', v)} />
            <Select title="Payment method" placeholder="All payment methods" options={PAYMENT_METHODS} value={filters.paymentMethod} onChange={(v) => setFilter('paymentMethod', v)} />
            <DateField placeholder="From date" clearable value={filters.startDate} max={filters.endDate || undefined} onChange={(v) => setFilter('startDate', v)} error={dateError} />
            <DateField placeholder="To date" clearable value={filters.endDate} min={filters.startDate || undefined} onChange={(v) => setFilter('endDate', v)} />
            {activeCount > 0 ? (
              <Pressable onPress={clearAll} accessibilityRole="button" className="flex-row items-center gap-1.5 self-start">
                <Icon as={X} size={16} className="text-brand-600 dark:text-brand-300" />
                <Text className="text-sm font-semibold text-brand-600 dark:text-brand-300">Clear all filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Card>

      <Card padded={false} className={refreshing ? 'opacity-60' : ''}>
        {isLoading && !data ? (
          <ListSkeleton rows={LIMIT / 2} />
        ) : error && !data ? (
          <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
        ) : transactions && transactions.length === 0 ? (
          activeCount > 0 ? (
            <EmptyState icon={SearchX} title="No matching transactions" description="Try a different search or loosen your filters."
              action={<Button variant="secondary" onPress={clearAll}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Receipt} title="No transactions yet" description="Start tracking your spending by adding your first transaction."
              action={<Button icon={Plus} onPress={() => openTransactionForm()}>Add Transaction</Button>} />
          )
        ) : transactions ? (
          <TransactionList transactions={transactions} onView={setViewTx} />
        ) : null}
      </Card>

      {data && data.totalPages > 1 ? (
        <View className="mt-4">
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onChange={setPage} />
        </View>
      ) : null}
      {error && data ? (
        <Text className="mt-3 text-center text-sm text-rose-600">{(error as Error).message}{' '}
          <Text onPress={() => refetch()} className="text-sm font-semibold text-rose-600 underline">Retry</Text>
        </Text>
      ) : null}

      <TransactionDetailModal
        id={viewTx?.id ?? null}
        seed={viewTx}
        onClose={() => setViewTx(null)}
        onEdit={(t) => { setViewTx(null); openTransactionForm(t); }}
        onDelete={setToDelete}
      />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={del.isPending} onClose={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)}
        title="Delete transaction?" message="This permanently removes the transaction and updates your balance, budgets and charts."
      />
    </Screen>
  );
}
