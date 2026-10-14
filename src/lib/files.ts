import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReportCsv, type DateRange } from '@/services/reportService';

/**
 * File storage
 * ------------
 * CSV exports are written to the app's private document directory (`exports/`), which survives app restarts
 * and needs no storage permission on any Android version. From there the user can share the file
 * (Drive, WhatsApp, email, "Save to Files"...) or copy it into a folder they pick (Storage Access Framework).
 */
const exportsDir = () => new Directory(Paths.document, 'exports');

export interface StoredExport {
  name: string;
  uri: string;
  size: number;
  modified: number;
}

export async function saveCsvExport(range: DateRange): Promise<StoredExport> {
  const csv = await getReportCsv(range);
  const dir = exportsDir();
  dir.create({ idempotent: true, intermediates: true });

  const file = new File(dir, `transactions_${range.startDate}_to_${range.endDate}.csv`);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);
  return toStored(file);
}

function toStored(file: File): StoredExport {
  return { name: file.name, uri: file.uri, size: file.size ?? 0, modified: file.modificationTime ?? 0 };
}

export function listExports(): StoredExport[] {
  const dir = exportsDir();
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((e): e is File => e instanceof File && e.name.endsWith('.csv'))
    .map(toStored)
    .sort((a, b) => b.modified - a.modified);
}

export function deleteExport(uri: string) {
  const file = new File(uri);
  if (file.exists) file.delete();
}

export async function shareExport(uri: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Share transactions CSV', UTI: 'public.comma-separated-values-text' });
}

/** Copies an export into a folder chosen by the user (e.g. Downloads). Resolves false if they cancel. */
export async function saveExportToDevice(uri: string): Promise<boolean> {
  let target: Directory;
  try {
    target = await Directory.pickDirectoryAsync();
  } catch {
    return false; // picker dismissed
  }
  const source = new File(uri);
  const copy = target.createFile(source.name.replace(/\.csv$/, ''), 'text/csv');
  copy.write(await source.text());
  return true;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
