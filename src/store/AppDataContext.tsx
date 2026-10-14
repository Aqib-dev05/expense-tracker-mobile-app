import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';
import TransactionFormModal from '@/components/TransactionFormModal';
import type { Transaction } from '@/types';

/**
 * Cross-screen coordination:
 *  - `invalidate()` marks every cached query stale after a mutation, so all screens refetch (same idea as the web `version` counter).
 *  - `openTransactionForm()` opens the add/edit sheet from anywhere (bottom nav, drawer, empty states).
 */
interface AppDataValue {
  invalidate: () => void;
  openTransactionForm: (transaction?: Transaction | null) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<{ open: boolean; transaction: Transaction | null }>({ open: false, transaction: null });

  const invalidate = useCallback(() => { queryClient.invalidateQueries(); }, []);
  const openTransactionForm = useCallback((transaction: Transaction | null = null) => setForm({ open: true, transaction }), []);
  const closeTransactionForm = useCallback(() => setForm((f) => ({ ...f, open: false })), []);

  const value = useMemo(() => ({ invalidate, openTransactionForm }), [invalidate, openTransactionForm]);

  return (
    <AppDataContext.Provider value={value}>
      {children}
      <TransactionFormModal open={form.open} transaction={form.transaction} onClose={closeTransactionForm} onSaved={invalidate} />
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext)!;
