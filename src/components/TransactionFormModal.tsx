import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select from './ui/Select';
import DateField from './ui/DateField';
import Grid from './ui/Grid';
import Text from './ui/Text';
import { Icon } from './ui/Icon';
import { Input, Textarea } from './ui/Input';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, categoryMeta } from '@/constants';
import { createTransaction, updateTransaction } from '@/services/transactionService';
import { useToast } from '@/store/ToastContext';
import { toDateInput } from '@/utils/format';
import type { ApiError, Transaction } from '@/types';

type Form = { type: string; amount: string; category: string; description: string; paymentMethod: string; date: string; notes: string };
type Errors = Partial<Record<keyof Form, string>>;

const emptyForm = (): Form => ({
  type: 'expense', amount: '', category: '', description: '', paymentMethod: 'Cash', date: toDateInput(), notes: '',
});

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!['income', 'expense'].includes(f.type)) e.type = 'Choose income or expense';
  const amt = Number(f.amount);
  if (f.amount === '' || !Number.isFinite(amt)) e.amount = 'Enter an amount';
  else if (amt <= 0) e.amount = 'Amount must be greater than 0';
  else if (!/^\d+(\.\d{1,2})?$/.test(String(f.amount))) e.amount = 'Use at most 2 decimal places';
  if (!f.category) e.category = 'Pick a category';
  if (!f.date || Number.isNaN(Date.parse(f.date))) e.date = 'Choose a valid date';
  if (f.description.length > 200) e.description = 'Keep it under 200 characters';
  if (f.notes.length > 1000) e.notes = 'Keep notes under 1000 characters';
  return e;
}

const TYPES = [
  { value: 'expense', label: 'Expense', icon: ArrowDownCircle, on: 'text-rose-600' },
  { value: 'income', label: 'Income', icon: ArrowUpCircle, on: 'text-emerald-600' },
];

export default function TransactionFormModal({ open, transaction, onClose, onSaved }: {
  open: boolean; transaction: Transaction | null; onClose: () => void; onSaved?: () => void;
}) {
  const toast = useToast();
  const editing = Boolean(transaction);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      transaction
        ? {
            type: transaction.type,
            amount: String(transaction.amount),
            category: transaction.category,
            description: transaction.description || '',
            paymentMethod: transaction.paymentMethod || 'Cash',
            date: transaction.date.slice(0, 10),
            notes: transaction.notes || '',
          }
        : emptyForm()
    );
  }, [open, transaction]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setType = (type: string) => {
    setForm((f) => {
      const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      return { ...f, type, category: list.includes(f.category) ? f.category : '' };
    });
    setErrors((e) => ({ ...e, type: undefined, category: undefined }));
  };

  const onAmount = (v: string) => {
    const clean = v.replace(',', '.');
    if (/^\d*\.?\d{0,2}$/.test(clean)) set('amount', clean);
  };

  const submit = async () => {
    const found = validate(form);
    if (Object.keys(found).length) return setErrors(found);

    const payload = {
      type: form.type as Transaction['type'],
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      paymentMethod: form.paymentMethod,
      date: form.date,
      notes: form.notes.trim(),
    };
    setSaving(true);
    try {
      if (transaction) await updateTransaction(transaction.id, payload);
      else await createTransaction(payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction added');
      onSaved?.();
      onClose();
    } catch (e) {
      const err = e as ApiError;
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={editing ? 'Edit transaction' : 'Add transaction'}
      footer={
        <View className="flex-col-reverse gap-2">
          <Button variant="secondary" onPress={onClose} disabled={saving}>Cancel</Button>
          <Button onPress={submit} loading={saving}>{editing ? 'Save changes' : 'Add transaction'}</Button>
        </View>
      }
    >
      <View className="gap-5">
        <View>
          <View className="flex-row gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-ink-800" accessibilityRole="radiogroup">
            {TYPES.map(({ value, label, icon, on }) => {
              const active = form.type === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => setType(value)}
                  className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${active ? 'bg-white dark:bg-ink-700' : ''}`}
                  style={active ? { elevation: 1 } : undefined}
                >
                  <Icon as={icon} size={16} className={active ? on : 'text-slate-500 dark:text-slate-400'} />
                  <Text className={`text-sm font-semibold ${active ? on : 'text-slate-500 dark:text-slate-400'}`}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.type ? <Text className="mt-1.5 text-xs font-medium text-rose-600">{errors.type}</Text> : null}
        </View>

        <Input
          label="Amount"
          keyboardType="decimal-pad"
          placeholder="0.00"
          autoComplete="off"
          value={form.amount}
          onChangeText={onAmount}
          error={errors.amount}
          className="text-lg font-bold"
        />

        <View>
          <Text className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">Category</Text>
          <Grid cols={3} gap={8}>
            {categories.map((c) => {
              const { emoji, color } = categoryMeta(c);
              const active = form.category === c;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => set('category', c)}
                  className={`min-h-[68px] items-center justify-center gap-1 rounded-xl border-2 px-1 py-2 ${
                    active ? '' : 'border-slate-200 active:bg-slate-50 dark:border-ink-700 dark:active:bg-ink-800'
                  }`}
                  style={active ? { backgroundColor: `${color}1f`, borderColor: color } : undefined}
                >
                  <Text className="text-xl">{emoji}</Text>
                  <Text numberOfLines={1} className={`max-w-full text-xs font-semibold ${active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{c}</Text>
                </Pressable>
              );
            })}
          </Grid>
          {errors.category ? <Text accessibilityRole="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.category}</Text> : null}
        </View>

        <Input
          label="Description (optional)"
          placeholder="e.g. Dinner with friends"
          maxLength={200}
          value={form.description}
          onChangeText={(v) => set('description', v)}
          error={errors.description}
        />

        <Select label="Payment method" options={PAYMENT_METHODS} value={form.paymentMethod} onChange={(v) => set('paymentMethod', v)} error={errors.paymentMethod} />
        <DateField label="Date" value={form.date} onChange={(v) => set('date', v)} error={errors.date} />

        <Textarea
          label="Notes (optional)"
          placeholder="Anything worth remembering"
          maxLength={1000}
          value={form.notes}
          onChangeText={(v) => set('notes', v)}
          error={errors.notes}
        />
      </View>
    </Modal>
  );
}
