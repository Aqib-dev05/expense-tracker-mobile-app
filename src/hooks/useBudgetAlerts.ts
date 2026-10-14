import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listBudgets } from '@/services/budgetService';
import { notifyBudgetStatus } from '@/lib/notifications';
import { usePreferences } from '@/store/PreferencesContext';
import { useAuth } from '@/store/AuthContext';

/** Shares the dashboard's cached "active budgets" query and raises a local notification when one nears / exceeds its limit. */
export default function useBudgetAlerts() {
  const { user } = useAuth();
  const { budgetAlerts } = usePreferences();
  const { data } = useQuery({
    queryKey: ['budgets', { active: 'true' }],
    queryFn: () => listBudgets({ active: 'true' }),
    enabled: Boolean(user) && budgetAlerts,
  });

  useEffect(() => {
    if (!user || !budgetAlerts || !data) return;
    notifyBudgetStatus(data, user.currency).catch(() => {});
  }, [data, user, budgetAlerts]);
}
