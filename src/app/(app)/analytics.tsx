import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Grid from '@/components/ui/Grid';
import Select from '@/components/ui/Select';
import DateField from '@/components/ui/DateField';
import { CardSkeleton, EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import SummaryCard from '@/components/SummaryCard';
import CategoryDonut from '@/components/charts/CategoryDonut';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import SpendingAreaChart from '@/components/charts/SpendingAreaChart';
import useColumns from '@/hooks/useColumns';
import useFormat from '@/hooks/useFormat';
import { RANGE_OPTIONS } from '@/constants';
import { getCategories, getSummary, getTrend } from '@/services/analyticsService';
import { formatBucketKey, toDateInput } from '@/utils/format';

function ChartCard({ title, subtitle, state, empty, children }: {
  title: string; subtitle: string; state: UseQueryResult<unknown, Error>; empty?: boolean; children: ReactNode;
}) {
  const { data, isLoading, error, refetch } = state;
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      {isLoading && !data ? <Skeleton className="h-64 w-full" />
        : error && !data ? <ErrorState compact message={error.message} onRetry={() => refetch()} />
        : empty ? <EmptyState icon={BarChart3} title="Nothing to chart yet" description="Add transactions in this period to see this chart." />
        : children}
    </Card>
  );
}

export default function Analytics() {
  const fmt = useFormat();
  const summaryCols = useColumns({ base: 1, sm: 3 });
  const now = new Date();
  const [range, setRange] = useState('this_month');
  const [custom, setCustom] = useState({ startDate: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: toDateInput() });
  const [applied, setApplied] = useState(custom);

  const customInvalid = !custom.startDate || !custom.endDate || custom.startDate > custom.endDate;
  const params = range === 'custom' ? { range, ...applied } : { range };

  const summary = useQuery({ queryKey: ['summary', params], queryFn: () => getSummary(params) });
  const trend = useQuery({ queryKey: ['trend', params], queryFn: () => getTrend(params) });
  const cats = useQuery({ queryKey: ['categories', { ...params, type: 'expense' }], queryFn: () => getCategories({ ...params, type: 'expense' }) });

  const trendData = (trend.data?.data || []).map((d) => ({ ...d, label: formatBucketKey(d.key) }));
  const hasTrend = trendData.some((d) => d.income > 0 || d.expense > 0);
  const daily = trend.data?.granularity === 'daily';
  const s = summary.data;

  return (
    <Screen>
      <PageHeader title="Analytics" subtitle="Understand where your money comes from and where it goes." />

      <Card className="mb-6 gap-3">
        <Select label="Period" options={RANGE_OPTIONS} value={range} onChange={setRange} />
        {range === 'custom' ? (
          <>
            <DateField label="From" value={custom.startDate} onChange={(v) => setCustom((c) => ({ ...c, startDate: v }))} />
            <DateField label="To" value={custom.endDate} min={custom.startDate}
              onChange={(v) => setCustom((c) => ({ ...c, endDate: v }))}
              error={custom.startDate && custom.endDate && custom.startDate > custom.endDate ? 'Must be after start' : undefined} />
            <Button disabled={customInvalid} onPress={() => setApplied(custom)}>Apply</Button>
          </>
        ) : null}
      </Card>

      <Grid cols={summaryCols}>
        {!s ? (
          summary.isLoading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height="h-32" />) : []
        ) : (
          [
            <SummaryCard key="i" title="Income" value={fmt.money(s.current.income)} icon={TrendingUp} tone="income" change={s.changes.income} comparisonLabel="vs previous period" />,
            <SummaryCard key="e" title="Expenses" value={fmt.money(s.current.expense)} icon={TrendingDown} tone="expense" change={s.changes.expense} lowerIsBetter comparisonLabel="vs previous period" />,
            <SummaryCard key="n" title="Net savings" value={fmt.money(s.current.savings)} icon={PiggyBank} tone="savings" change={s.changes.savings} comparisonLabel="vs previous period" />,
          ]
        )}
      </Grid>
      {summary.error && !s ? <Card className="mt-4" padded={false}><ErrorState compact message={(summary.error as Error).message} onRetry={() => summary.refetch()} /></Card> : null}

      <View className="mt-6 gap-6">
        <ChartCard title="Income vs expense" subtitle={daily ? 'Daily comparison' : 'Monthly comparison'} state={trend as UseQueryResult<unknown, Error>} empty={!hasTrend}>
          <IncomeExpenseChart data={trendData} />
        </ChartCard>

        <ChartCard title="Expense by category" subtitle="Share of total spending" state={cats as UseQueryResult<unknown, Error>} empty={Boolean(cats.data && cats.data.categories.length === 0)}>
          {cats.data ? <CategoryDonut data={cats.data.categories} total={cats.data.total} /> : null}
        </ChartCard>

        <ChartCard title="Spending over time" subtitle={daily ? 'Daily expenses' : 'Monthly expenses'} state={trend as UseQueryResult<unknown, Error>} empty={!hasTrend}>
          <SpendingAreaChart data={trendData} />
        </ChartCard>
      </View>
    </Screen>
  );
}
