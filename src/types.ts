/** Shapes returned by the Express API (see backend/src/services and models). */

export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  paymentMethod: string;
  date: string;
  notes?: string;
}

export interface TransactionPage {
  transactions: Transaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionFilters {
  search?: string;
  type?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface PeriodTotals {
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

export interface Summary {
  current: PeriodTotals;
  allTime: { balance: number };
  changes: { income: number | null; expense: number | null; savings: number | null };
}

export interface TrendPoint {
  key: string;
  income: number;
  expense: number;
}
export interface Trend {
  granularity: 'daily' | 'monthly';
  data: TrendPoint[];
}

export interface CategoryRow {
  category: string;
  total: number;
  percentage: number;
}
export interface Categories {
  total: number;
  categories: CategoryRow[];
}

export interface ReportSummary {
  range: { startDate: string; endDate: string };
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  topExpenseCategory: { category: string; total: number; percentage: number } | null;
  largestExpense: Transaction | null;
}

export interface AnalyticsParams {
  range?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export interface ApiError extends Error {
  status?: number;
  details?: { field: string; message: string }[];
}
