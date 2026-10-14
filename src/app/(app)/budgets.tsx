import { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PiggyBank, Plus } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Grid from '@/components/ui/Grid';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import BudgetCard from '@/components/BudgetCard';
import BudgetFormModal from '@/components/BudgetFormModal';
import useColumns from '@/hooks/useColumns';
import useFormat from '@/hooks/useFormat';
import { deleteBudget, listBudgets } from '@/services/budgetService';
import { useAppData } from '@/store/AppDataContext';
import { useToast } from '@/store/ToastContext';
import type { Budget } from '@/types';

export default function Budgets() {
  const fmt = useFormat();
  const toast = useToast();
  const { invalidate } = useAppData();
  const cols = useColumns({ base: 1, sm: 2, xl: 3 });
  const [form, setForm] = useState<{ open: boolean; budget: Budget | null }>({ open: false, budget: null });
  const [toDelete, setToDelete] = useState<Budget | null>(null);

  const { data: budgets, isLoading, error, refetch } = useQuery({ queryKey: ['budgets', {}], queryFn: () => listBudgets() });

  const today = new Date().toISOString().slice(0, 10);
  const active = (budgets || []).filter((b) => b.startDate.slice(0, 10) <= today && b.endDate.slice(0, 10) >= today);
  const past = (budgets || []).filter((b) => !active.includes(b));
  const totals = active.reduce((a, b) => ({ budget: a.budget + b.amount, spent: a.spent + b.spent }), { budget: 0, spent: 0 });
  const alerts = active.filter((b) => b.status !== 'ok');

  const del = useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => { toast.success('Budget deleted'); setToDelete(null); invalidate(); },
    onError: (e) => toast.error((e as Error).message),
  });

  const edit = (b: Budget) => setForm({ open: true, budget: b });
  const openNew = () => setForm({ open: true, budget: null });

  return (
    <Screen>
      <PageHeader
        title="Budgets"
        subtitle="Set limits by category and see how you’re tracking. Going over never blocks a transaction."
        actions={<Button icon={Plus} onPress={openNew}>New budget</Button>}
      />

      {isLoading && !budgets ? (
        <Grid cols={cols}>{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height="h-52" />)}</Grid>
      ) : error && !budgets ? (
        <Card padded={false}><ErrorState message={(error as Error).message} onRetry={() => refetch()} /></Card>
      ) : budgets && budgets.length === 0 ? (
        <Card padded={false}>
          <EmptyState icon={PiggyBank} title="No budgets yet" description="Create a budget for a category like Food or Shopping to see how much you have left."
            action={<Button icon={Plus} onPress={openNew}>Create budget</Button>} />
        </Card>
      ) : budgets ? (
        <View className="gap-8">
          {active.length > 0 ? (
            <Card className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active budgets</Text>
                <Text className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {fmt.money(totals.spent)} <Text className="text-base font-semibold text-slate-500 dark:text-slate-400">of {fmt.money(totals.budget)} spent</Text>
                </Text>
              </View>
              {alerts.length > 0 ? (
                <View className="rounded-xl bg-amber-50 px-3.5 py-2.5 dark:bg-amber-500/10">
                  <Text className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {alerts.length} {alerts.length === 1 ? 'budget needs' : 'budgets need'} attention: {alerts.map((b) => b.category).join(', ')}
                  </Text>
                </View>
              ) : null}
            </Card>
          ) : null}

          {active.length > 0 ? (
            <Grid cols={cols}>{active.map((b) => <BudgetCard key={b.id} budget={b} onEdit={edit} onDelete={setToDelete} />)}</Grid>
          ) : null}

          {past.length > 0 ? (
            <View>
              <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Past & upcoming</Text>
              <Grid cols={cols}>{past.map((b) => <BudgetCard key={b.id} budget={b} onEdit={edit} onDelete={setToDelete} />)}</Grid>
            </View>
          ) : null}
        </View>
      ) : null}

      <BudgetFormModal open={form.open} budget={form.budget} onClose={() => setForm((f) => ({ ...f, open: false }))} onSaved={invalidate} />
      <ConfirmDialog
        open={Boolean(toDelete)} loading={del.isPending} onClose={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)}
        title="Delete budget?" message={toDelete ? `The ${toDelete.category} budget will be removed. Your transactions are not affected.` : ''}
      />
    </Screen>
  );
}
