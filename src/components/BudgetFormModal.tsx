import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select from './ui/Select';
import DateField from './ui/DateField';
import { Input } from './ui/Input';
import { EXPENSE_CATEGORIES, BUDGET_PERIODS } from '@/constants';
import { createBudget, updateBudget, type BudgetPayload } from '@/services/budgetService';
import { useToast } from '@/store/ToastContext';
import { toDateInput } from '@/utils/format';
import type { ApiError, Budget } from '@/types';

type Form = { category: string; amount: string; period: string; startDate: string; endDate: string };
type Errors = Partial<Record<keyof Form, string>>;

const defaultStart = (period: string) => {
  const n = new Date();
  if (period === 'monthly') return toDateInput(new Date(n.getFullYear(), n.getMonth(), 1));
  if (period === 'yearly') return toDateInput(new Date(n.getFullYear(), 0, 1));
  return toDateInput(n);
};
const endOfMonth = () => { const n = new Date(); return toDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0)); };

const empty = (): Form => ({ category: '', amount: '', period: 'monthly', startDate: defaultStart('monthly'), endDate: endOfMonth() });

export default function BudgetFormModal({ open, budget, onClose, onSaved }: {
  open: boolean; budget: Budget | null; onClose: () => void; onSaved?: () => void;
}) {
  const toast = useToast();
  const editing = Boolean(budget);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      budget
        ? { category: budget.category, amount: String(budget.amount), period: budget.period, startDate: budget.startDate.slice(0, 10), endDate: budget.endDate.slice(0, 10) }
        : empty()
    );
  }, [open, budget]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const setPeriod = (period: string) => setForm((f) => ({ ...f, period, startDate: defaultStart(period) }));

  const submit = async () => {
    const e: Errors = {};
    const amt = Number(form.amount);
    if (!form.category) e.category = 'Pick a category';
    if (form.amount === '' || !Number.isFinite(amt) || amt <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.startDate) e.startDate = 'Choose a start date';
    if (form.period === 'custom') {
      if (!form.endDate) e.endDate = 'Choose an end date';
      else if (form.endDate < form.startDate) e.endDate = 'End date must be after the start date';
    }
    if (Object.keys(e).length) return setErrors(e);

    const payload: BudgetPayload = { category: form.category, amount: amt, period: form.period, startDate: form.startDate };
    if (form.period === 'custom') payload.endDate = form.endDate;

    setSaving(true);
    try {
      if (budget) await updateBudget(budget.id, payload);
      else await createBudget(payload);
      toast.success(editing ? 'Budget updated' : 'Budget created');
      onSaved?.();
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.details?.length) setErrors(Object.fromEntries(apiErr.details.map((d) => [d.field, d.message])));
      toast.error(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={editing ? 'Edit budget' : 'New budget'}
      footer={
        <View className="flex-col-reverse gap-2">
          <Button variant="secondary" onPress={onClose} disabled={saving}>Cancel</Button>
          <Button onPress={submit} loading={saving}>{editing ? 'Save changes' : 'Create budget'}</Button>
        </View>
      }
    >
      <View className="gap-4">
        <Select label="Category" placeholder="Select a category" options={EXPENSE_CATEGORIES} value={form.category} onChange={(v) => set('category', v)} error={errors.category} />
        <Input
          label="Budget amount"
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={form.amount}
          onChangeText={(v) => { const c = v.replace(',', '.'); if (/^\d*\.?\d{0,2}$/.test(c)) set('amount', c); }}
          error={errors.amount}
        />
        <Select label="Period" options={BUDGET_PERIODS} value={form.period} onChange={setPeriod} error={errors.period} />
        <DateField
          label="Start date" value={form.startDate} onChange={(v) => set('startDate', v)} error={errors.startDate}
          hint={form.period !== 'custom' ? 'The end date is calculated from the period.' : undefined}
        />
        {form.period === 'custom' ? (
          <DateField label="End date" value={form.endDate} min={form.startDate} onChange={(v) => set('endDate', v)} error={errors.endDate} />
        ) : null}
      </View>
    </Modal>
  );
}
