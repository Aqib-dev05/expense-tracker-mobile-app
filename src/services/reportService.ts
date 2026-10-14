import api from './api';
import type { ReportSummary } from '@/types';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const getReportSummary = async (params: DateRange): Promise<ReportSummary> =>
  (await api.get('/reports/summary', { params })).data;

/** Raw CSV text (the server prepends a UTF-8 BOM so Excel opens it correctly). */
export const getReportCsv = async (params: DateRange): Promise<string> =>
  (await api.get('/reports/export', { params, responseType: 'text' })).data;
