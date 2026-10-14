import { useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { usePreferences } from '@/store/PreferencesContext';
import { formatDate, formatMoney } from '@/utils/format';

/** Currency + date formatters bound to the user's settings. */
export default function useFormat() {
  const { user } = useAuth();
  const { dateFormat } = usePreferences();
  const currency = user?.currency || 'PKR';
  return useMemo(
    () => ({
      currency,
      money: (n: number | string, opts?: { sign?: boolean }) => formatMoney(n, currency, opts),
      date: (d?: string | Date | null) => formatDate(d, dateFormat),
      dateFormat,
    }),
    [currency, dateFormat]
  );
}
