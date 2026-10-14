import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Download, FileText, Hash, PiggyBank, ReceiptText, Share2, ShoppingBag, Trash2, TrendingDown, TrendingUp, Trophy, FolderDown,
  type LucideIcon,
} from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Grid from '@/components/ui/Grid';
import DateField from '@/components/ui/DateField';
import { Icon } from '@/components/ui/Icon';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import CategoryIcon from '@/components/CategoryIcon';
import useColumns from '@/hooks/useColumns';
import useFormat from '@/hooks/useFormat';
import { RANGE_OPTIONS } from '@/constants';
import { getReportSummary } from '@/services/reportService';
import { deleteExport, formatBytes, listExports, saveCsvExport, saveExportToDevice, shareExport, type StoredExport } from '@/lib/files';
import { useToast } from '@/store/ToastContext';
import { getPresetRange } from '@/utils/dates';
import { formatDate } from '@/utils/format';

const TONES = {
  income: 'bg-emerald-50 dark:bg-emerald-500/15',
  expense: 'bg-rose-50 dark:bg-rose-500/15',
  brand: 'bg-brand-50 dark:bg-brand-500/15',
  amber: 'bg-amber-50 dark:bg-amber-500/15',
};
const ICON_TONES = {
  income: 'text-emerald-600 dark:text-emerald-300',
  expense: 'text-rose-600 dark:text-rose-300',
  brand: 'text-brand-600 dark:text-brand-300',
  amber: 'text-amber-600 dark:text-amber-300',
};

function Stat({ icon, label, tone, children, sub }: { icon: LucideIcon; label: string; tone: keyof typeof TONES; children: ReactNode; sub?: string }) {
  return (
    <Card className="flex-row items-start gap-4">
      <View className={`h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon as={icon} size={20} className={ICON_TONES[tone]} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</Text>
        <View className="mt-1">{children}</View>
        {sub ? <Text numberOfLines={1} className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</Text> : null}
      </View>
    </Card>
  );
}
const Big = ({ children, className = '' }: { children: string; className?: string }) => (
  <Text numberOfLines={1} className={`text-xl font-extrabold text-slate-900 dark:text-white ${className}`}>{children}</Text>
);

export default function Reports() {
  const fmt = useFormat();
  const toast = useToast();
  const cols = useColumns({ base: 1, sm: 2, xl: 3 });
  const [preset, setPreset] = useState('this_month');
  const [dates, setDates] = useState(() => getPresetRange('this_month'));
  const [exporting, setExporting] = useState(false);
  const [files, setFiles] = useState<StoredExport[]>(() => { try { return listExports(); } catch { return []; } });

  const invalid = !dates.startDate || !dates.endDate || dates.startDate > dates.endDate;
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['report', dates],
    queryFn: () => getReportSummary(dates),
    enabled: !invalid,
  });

  const choosePreset = (value: string) => {
    setPreset(value);
    if (value !== 'custom') setDates(getPresetRange(value));
  };
  const setDate = (k: 'startDate' | 'endDate', v: string) => { setPreset('custom'); setDates((d) => ({ ...d, [k]: v })); };
  const refreshFiles = () => { try { setFiles(listExports()); } catch { setFiles([]); } };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const saved = await saveCsvExport(dates);
      refreshFiles();
      toast.success('CSV saved on this device');
      await shareExport(saved.uri).catch(() => {}); // offering the share sheet is a convenience, not a requirement
    } catch (e) { toast.error((e as Error).message); } finally { setExporting(false); }
  };

  const share = (f: StoredExport) => shareExport(f.uri).catch((e) => toast.error((e as Error).message));
  const saveToFolder = async (f: StoredExport) => {
    try { if (await saveExportToDevice(f.uri)) toast.success('Saved to the folder you chose'); }
    catch (e) { toast.error((e as Error).message); }
  };
  const remove = (f: StoredExport) => { try { deleteExport(f.uri); refreshFiles(); toast.success('Export deleted'); } catch (e) { toast.error((e as Error).message); } };

  return (
    <Screen>
      <PageHeader
        title="Reports"
        subtitle="Generate a financial summary for any date range and export it."
        actions={<Button icon={Download} onPress={exportCsv} loading={exporting} disabled={invalid}>Export CSV</Button>}
      />

      <Card className="mb-6 gap-4">
        <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
          {RANGE_OPTIONS.map((o) => {
            const active = preset === o.value;
            return (
              <Pressable
                key={o.value}
                onPress={() => choosePreset(o.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                className={`h-10 justify-center rounded-xl px-4 ${active ? 'bg-brand-600' : 'bg-slate-100 active:bg-slate-200 dark:bg-ink-800 dark:active:bg-ink-700'}`}
              >
                <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <DateField label="From" value={dates.startDate} onChange={(v) => setDate('startDate', v)} />
        <DateField label="To" value={dates.endDate} min={dates.startDate} onChange={(v) => setDate('endDate', v)}
          error={dates.startDate && dates.endDate && dates.startDate > dates.endDate ? 'Must be on or after the start date' : undefined} />
      </Card>

      {isLoading && !data ? (
        <Grid cols={cols}>{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} height="h-28" />)}</Grid>
      ) : error && !data ? (
        <Card padded={false}><ErrorState message={(error as Error).message} onRetry={() => refetch()} /></Card>
      ) : !data ? (
        <Card padded={false}><EmptyState icon={FileText} title="Choose a valid date range" description="Pick a start and end date to generate your report." /></Card>
      ) : data.transactionCount === 0 ? (
        <Card padded={false}><EmptyState icon={ReceiptText} title="No transactions in this period" description="Try another date range, or add transactions to include them in reports." /></Card>
      ) : (
        <View className={isFetching ? 'opacity-60' : ''}>
          <Grid cols={cols}>
            <Stat icon={TrendingUp} label="Total income" tone="income"><Big>{fmt.money(data.totalIncome)}</Big></Stat>
            <Stat icon={TrendingDown} label="Total expenses" tone="expense"><Big>{fmt.money(data.totalExpenses)}</Big></Stat>
            <Stat icon={PiggyBank} label="Net savings" tone="amber"><Big className={data.netSavings < 0 ? 'text-rose-600 dark:text-rose-400' : ''}>{fmt.money(data.netSavings)}</Big></Stat>
            <Stat icon={Trophy} label="Top expense category" tone="brand"
              sub={data.topExpenseCategory ? `${fmt.money(data.topExpenseCategory.total)} · ${data.topExpenseCategory.percentage}% of expenses` : undefined}>
              {data.topExpenseCategory ? (
                <View className="flex-row items-center gap-2">
                  <CategoryIcon category={data.topExpenseCategory.category} size="sm" />
                  <Big>{data.topExpenseCategory.category}</Big>
                </View>
              ) : <Big>—</Big>}
            </Stat>
            <Stat icon={ShoppingBag} label="Largest expense" tone="expense"
              sub={data.largestExpense ? `${data.largestExpense.description || data.largestExpense.category} · ${fmt.date(data.largestExpense.date)}` : undefined}>
              <Big>{data.largestExpense ? fmt.money(data.largestExpense.amount) : '—'}</Big>
            </Stat>
            <Stat icon={Hash} label="Transactions" tone="brand"><Big>{String(data.transactionCount)}</Big></Stat>
          </Grid>
        </View>
      )}

      <Card className="mt-6">
        <CardHeader title="Saved exports" subtitle="CSV files stored on this device" />
        {files.length === 0 ? (
          <Text className="text-sm text-slate-500 dark:text-slate-400">No exports yet. Tap “Export CSV” to save one here and share it.</Text>
        ) : (
          <View>
            {files.map((f, i) => (
              <View key={f.uri} className={`gap-2 py-3 ${i ? 'border-t border-slate-100 dark:border-ink-800' : ''}`}>
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
                    <Icon as={FileText} size={18} className="text-brand-600 dark:text-brand-300" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.name}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(f.size)}{f.modified ? ` · ${formatDate(new Date(f.modified), fmt.dateFormat)}` : ''}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Button variant="secondary" size="sm" icon={Share2} className="flex-1" onPress={() => share(f)}>Share</Button>
                  <Button variant="secondary" size="sm" icon={FolderDown} className="flex-1" onPress={() => saveToFolder(f)}>Save to…</Button>
                  <Button variant="ghost" size="icon" icon={Trash2} onPress={() => remove(f)} accessibilityLabel={`Delete ${f.name}`} />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}
