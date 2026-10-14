// Formatting is done by hand (no Intl) so output is identical on every Android version / Hermes build.
const SYMBOLS: Record<string, string> = { PKR: 'Rs. ', USD: '$', EUR: '€', GBP: '£', INR: '₹', AED: 'AED ', SAR: 'SAR ' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

const group = (intPart: string) => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function formatMoney(amount: number | string, currency = 'PKR', { sign = false } = {}) {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  const cents = Math.round(abs * 100);
  const digits = cents % 100 === 0 ? 0 : 2;
  const [i, d] = (cents / 100).toFixed(2).split('.');
  const num = digits === 0 ? group(i) : `${group(i)}.${d}`;
  const prefix = n < 0 ? '-' : sign && n > 0 ? '+' : '';
  return `${prefix}${SYMBOLS[currency] ?? `${currency} `}${num}`;
}

export function formatCompact(value: number) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const fmt = (v: number, suffix: string) => `${(Math.round(v * 10) / 10).toString()}${suffix}`;
  if (abs >= 1e9) return fmt(n / 1e9, 'B');
  if (abs >= 1e6) return fmt(n / 1e6, 'M');
  if (abs >= 1e3) return fmt(n / 1e3, 'K');
  return String(Math.round(n * 10) / 10);
}

/** Dates from the API are UTC-midnight calendar days, so always read them in UTC. */
export function formatDate(value?: string | Date | null, fmt = 'short') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  switch (fmt) {
    case 'dmy': return `${pad(day)}/${pad(m + 1)}/${y}`;
    case 'mdy': return `${pad(m + 1)}/${pad(day)}/${y}`;
    case 'iso': return `${y}-${pad(m + 1)}-${pad(day)}`;
    default: return `${MONTHS[m]} ${pad(day)}, ${y}`;
  }
}

/** Formats a local 'YYYY-MM-DD' string (from a date picker) using the user's date format. */
export function formatDateInput(value: string, fmt = 'short') {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return formatDate(new Date(Date.UTC(y, m - 1, d)), fmt);
}

/** Chart axis labels for backend bucket keys: '2026-10' -> "Oct '26", '2026-10-08' -> 'Oct 8'. */
export function formatBucketKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return d ? `${MONTHS[m - 1]} ${d}` : `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}

/** Local calendar date as YYYY-MM-DD (the format the API and date pickers use). */
export const toDateInput = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parses a 'YYYY-MM-DD' string as a local-time Date (noon avoids DST edge cases). */
export const fromDateInput = (s: string) => {
  const [y, m, d] = (s || toDateInput()).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const percent = (n: number) => `${Math.abs(n).toFixed(Math.abs(n) % 1 === 0 ? 0 : 1)}%`;
