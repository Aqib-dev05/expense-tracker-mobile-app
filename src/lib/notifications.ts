import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Budget } from '@/types';
import { KEYS, readJson, writeJson } from './storage';
import { formatMoney } from '@/utils/format';

/**
 * Local notifications only (no push server needed, works offline and in every Android version):
 *  - budget alerts when a budget reaches 80% ("warning") or goes over ("exceeded")
 *  - an optional daily "log your expenses" reminder
 */
const CH_ALERTS = 'budget-alerts';
const CH_REMINDERS = 'reminders';
const REMINDER_ID = 'daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let channelsReady: Promise<void> | null = null;
/** Android 8+ requires a notification channel; created once, safe to call repeatedly. */
export function ensureChannels() {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelsReady ??= (async () => {
    await Notifications.setNotificationChannelAsync(CH_ALERTS, {
      name: 'Budget alerts',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#2f45dc',
    });
    await Notifications.setNotificationChannelAsync(CH_REMINDERS, {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#2f45dc',
    });
  })();
  return channelsReady;
}

export async function hasNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/** Asks for permission if it has not been decided yet (Android 13+ shows the system prompt). */
export async function requestNotificationPermission() {
  await ensureChannels();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.status === 'granted';
}

/** Schedules (or replaces) the repeating daily reminder. */
export async function scheduleDailyReminder(hour: number, minute: number) {
  if (!(await requestNotificationPermission())) return false;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Log today’s spending',
      body: 'Take a minute to add today’s income and expenses to Ledgerly.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CH_REMINDERS },
  });
  return true;
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}

/**
 * Fires a local notification for every budget that newly crossed 80% / 100%.
 * Each (budget, status, period end) is notified once, tracked in AsyncStorage.
 */
export async function notifyBudgetStatus(budgets: Budget[], currency: string) {
  const flagged = budgets.filter((b) => b.status !== 'ok');
  if (flagged.length === 0) return;
  if (!(await hasNotificationPermission())) return;
  await ensureChannels();

  const seen = await readJson<Record<string, true>>(KEYS.budgetAlerts, {});
  let changed = false;

  for (const b of flagged) {
    const key = `${b.id}:${b.status}:${b.endDate.slice(0, 10)}`;
    if (seen[key]) continue;
    seen[key] = true;
    changed = true;

    const exceeded = b.status === 'exceeded';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: exceeded ? `${b.category} budget exceeded` : `${b.category} budget nearly used up`,
        body: exceeded
          ? `You’re over by ${formatMoney(-b.remaining, currency)} (${Math.round(b.percentage)}% of ${formatMoney(b.amount, currency)}).`
          : `You’ve used ${Math.round(b.percentage)}% of your ${formatMoney(b.amount, currency)} budget — ${formatMoney(b.remaining, currency)} left.`,
        data: { budgetId: b.id },
      },
      trigger: Platform.OS === 'android' ? { channelId: CH_ALERTS } : null,
    });
  }

  if (changed) {
    // Keep the dedupe map from growing forever.
    const keys = Object.keys(seen);
    if (keys.length > 200) for (const k of keys.slice(0, keys.length - 200)) delete seen[k];
    await writeJson(KEYS.budgetAlerts, seen);
  }
}
