import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, PieChart as PieIcon, PiggyBank, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Grid from '@/components/ui/Grid';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProgressBar from '@/components/ui/ProgressBar';
import { CardSkeleton, EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/ui/States';
import SummaryCard from '@/components/SummaryCard';
import TransactionList from '@/components/TransactionList';
import TransactionDetailModal from '@/components/TransactionDetailModal';
import CategoryDonut from '@/components/charts/CategoryDonut';
import CategoryIcon from '@/components/CategoryIcon';
import useColumns from '@/hooks/useColumns';
import useFormat from '@/hooks/useFormat';
import { useAppData } from '@/store/AppDataContext';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { getCategories, getSummary } from '@/services/analyticsService';
import { deleteTransaction, listTransactions } from '@/services/transactionService';
import { listBudgets } from '@/services/budgetService';
import type { Transaction } from '@/types';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const fmt = useFormat();
  const toast = useToast();
  const { invalidate, openTransactionForm } = useAppData();
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const summaryCols = useColumns({ base: 1, sm: 2, xl: 4 });
  const budgetCols = useColumns({ base: 1, sm: 2 });

  const summary = useQuery({ queryKey: ['summary', { range: 'this_month' }], queryFn: () => getSummary({ range: 'this_month' }) });
  const cats = useQuery({ queryKey: ['categories', { range: 'this_month', type: 'expense' }], queryFn: () => getCategories({ range: 'this_month', type: 'expense' }) });
  const recent = useQuery({ queryKey: ['transactions', { page: 1, limit: 6, sort: 'newest' }], queryFn: () => listTransactions({ page: 1, limit: 6, sort: 'newest' }) });
  const budgets = useQuery({ queryKey: ['budgets', { active: 'true' }], queryFn: () => listBudgets({ active: 'true' }) });

  const del = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => { toast.success('Transaction deleted'); setToDelete(null); setViewTx(null); invalidate(); },
    onError: (e) => toast.error((e as Error).message),
  });

  const s = summary.data;

  return (
    <Screen>
      <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0]}`} subtitle="Here’s your financial snapshot for this month." />

      {summary.error && !s ? (
        <Card padded={false}><ErrorState message={(summary.error as Error).message} onRetry={() => summary.refetch()} compact /></Card>
      ) : (
        <Grid cols={summaryCols}>
          {!s ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height="h-36" />)
          ) : (
            [
              <SummaryCard key="b" title="Total Balance" value={fmt.money(s.allTime.balance)} icon={Wallet} tone="brand" footnote="All-time income minus expenses" />,
              <SummaryCard key="i" title="Income" value={fmt.money(s.current.income)} icon={TrendingUp} tone="income" change={s.changes.income} footnote="This month" />,
              <SummaryCard key="e" title="Expenses" value={fmt.money(s.current.expense)} icon={TrendingDown} tone="expense" change={s.changes.expense} lowerIsBetter footnote="This month" />,
              <SummaryCard
                key="s" title="Savings" value={fmt.money(s.current.savings)} icon={PiggyBank} tone="savings" change={s.changes.savings}
                footnote={s.current.income > 0 ? `${s.current.savingsRate}% of this month’s income` : 'This month'}
              />,
            ]
          )}
        </Grid>
      )}

      <View className="mt-6 gap-6">
        <Card>
          <CardHeader title="Spending by category" subtitle="This month" />
          {cats.isLoading && !cats.data ? (
            <View className="items-center gap-4"><Skeleton className="h-52 w-52 rounded-full" /><View className="w-full gap-3"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></View></View>
          ) : cats.error && !cats.data ? (
            <ErrorState compact message={(cats.error as Error).message} onRetry={() => cats.refetch()} />
          ) : cats.data && cats.data.categories.length === 0 ? (
            <EmptyState icon={PieIcon} title="No spending yet" description="Expenses you add this month will be broken down here." />
          ) : cats.data ? (
            <CategoryDonut data={cats.data.categories} total={cats.data.total} />
          ) : null}
        </Card>

        <Card padded={false}>
          <View className="flex-row items-center justify-between px-5 pt-5">
            <CardHeader title="Recent transactions" />
            <Button variant="ghost" size="sm" className="-mt-4" onPress={() => router.navigate('/transactions')}>View all</Button>
          </View>
          {recent.isLoading && !recent.data ? (
            <ListSkeleton rows={5} />
          ) : recent.error && !recent.data ? (
            <ErrorState compact message={(recent.error as Error).message} onRetry={() => recent.refetch()} />
          ) : recent.data && recent.data.transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Start tracking your spending by adding your first transaction."
              action={<Button icon={Plus} onPress={() => openTransactionForm()}>Add Transaction</Button>}
            />
          ) : recent.data ? (
            <TransactionList transactions={recent.data.transactions} onView={setViewTx} />
          ) : null}
        </Card>
      </View>

      <Card className="mt-6">
        <CardHeader
          title="Budget overview"
          subtitle="Your active budgets"
          action={<Button variant="secondary" size="sm" onPress={() => router.navigate('/budgets')}>View all budgets</Button>}
        />
        {budgets.isLoading && !budgets.data ? (
          <View className="gap-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></View>
        ) : budgets.error && !budgets.data ? (
          <ErrorState compact message={(budgets.error as Error).message} onRetry={() => budgets.refetch()} />
        ) : budgets.data && budgets.data.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No active budgets" description="Set a monthly limit for categories like Food or Shopping and we’ll track it for you."
            action={<Button onPress={() => router.navigate('/budgets')}>Create a budget</Button>} />
        ) : budgets.data ? (
          <Grid cols={budgetCols} gap={20}>
            {budgets.data.slice(0, 4).map((b) => (
              <View key={b.id}>
                <View className="mb-2 flex-row items-center gap-3">
                  <CategoryIcon category={b.category} size="sm" />
                  <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-semibold text-slate-900 dark:text-white">{b.category}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-100">{fmt.money(b.spent)}</Text> / {fmt.money(b.amount)}
                  </Text>
                </View>
                <ProgressBar percentage={b.percentage} status={b.status} label={`${b.category} budget used`} />
              </View>
            ))}
          </Grid>
        ) : null}
      </Card>

      <TransactionDetailModal
        id={viewTx?.id ?? null}
        seed={viewTx}
        onClose={() => setViewTx(null)}
        onEdit={(t) => { setViewTx(null); openTransactionForm(t); }}
        onDelete={(t) => setToDelete(t)}
      />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={del.isPending} onClose={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)}
        title="Delete transaction?" message="This permanently removes the transaction and updates your balance, budgets and charts."
      />
    </Screen>
  );
}
