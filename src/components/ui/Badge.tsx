import type { ReactNode } from 'react';
import { View } from 'react-native';
import Text from './Text';

const tones = {
  neutral: { box: 'bg-slate-100 dark:bg-ink-800', text: 'text-slate-700 dark:text-slate-300' },
  brand: { box: 'bg-brand-50 dark:bg-brand-500/15', text: 'text-brand-700 dark:text-brand-300' },
  income: { box: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300' },
  expense: { box: 'bg-rose-50 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-300' },
  warning: { box: 'bg-amber-50 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300' },
};
export type BadgeTone = keyof typeof tones;
export const badgeTextClass = (tone: BadgeTone) => tones[tone].text;

export default function Badge({ tone = 'neutral', className = '', icon, children }: {
  tone?: BadgeTone; className?: string; icon?: ReactNode; children: string;
}) {
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5 ${tones[tone].box} ${className}`}>
      {icon}
      <Text className={`text-xs font-semibold ${tones[tone].text}`}>{children}</Text>
    </View>
  );
}
