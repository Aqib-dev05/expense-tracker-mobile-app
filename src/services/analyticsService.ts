import api, { cleanParams } from './api';
import type { AnalyticsParams, Categories, Summary, Trend } from '@/types';

export const getSummary = async (params: AnalyticsParams): Promise<Summary> =>
  (await api.get('/analytics/summary', { params: cleanParams(params) })).data;
export const getTrend = async (params: AnalyticsParams): Promise<Trend> =>
  (await api.get('/analytics/monthly', { params: cleanParams(params) })).data;
export const getCategories = async (params: AnalyticsParams): Promise<Categories> =>
  (await api.get('/analytics/categories', { params: cleanParams(params) })).data;
