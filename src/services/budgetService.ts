import api, { cleanParams } from './api';
import type { Budget } from '@/types';

export interface BudgetPayload {
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
}

export const listBudgets = async (params?: { active?: string }): Promise<Budget[]> =>
  (await api.get('/budgets', { params: cleanParams(params) })).data.budgets;
export const createBudget = async (payload: BudgetPayload): Promise<Budget> => (await api.post('/budgets', payload)).data.budget;
export const updateBudget = async (id: string, payload: Partial<BudgetPayload>): Promise<Budget> =>
  (await api.patch(`/budgets/${id}`, payload)).data.budget;
export const deleteBudget = async (id: string) => (await api.delete(`/budgets/${id}`)).data;
