import api, { cleanParams } from './api';
import type { Transaction, TransactionFilters, TransactionPage } from '@/types';

export type TransactionPayload = Omit<Transaction, 'id'>;

export const listTransactions = async (params: TransactionFilters): Promise<TransactionPage> =>
  (await api.get('/transactions', { params: cleanParams(params) })).data;
export const getTransaction = async (id: string): Promise<Transaction> => (await api.get(`/transactions/${id}`)).data.transaction;
export const createTransaction = async (payload: TransactionPayload): Promise<Transaction> =>
  (await api.post('/transactions', payload)).data.transaction;
export const updateTransaction = async (id: string, payload: Partial<TransactionPayload>): Promise<Transaction> =>
  (await api.patch(`/transactions/${id}`, payload)).data.transaction;
export const deleteTransaction = async (id: string) => (await api.delete(`/transactions/${id}`)).data;
