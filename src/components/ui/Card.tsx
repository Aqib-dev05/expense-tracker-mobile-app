import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import Text from './Text';

// Same soft shadow as the web `shadow-card`, expressed for Android (elevation) + iOS shadow props.
export const cardShadow = {
  elevation: 1,
  shadowColor: '#0f172a',
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
} as const;

interface CardProps extends ViewProps {
  padded?: boolean;
  className?: string;
}

export default function Card({ className = '', padded = true, style, children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-slate-200 bg-white dark:border-ink-800 dark:bg-ink-900 ${padded ? 'p-5' : 'overflow-hidden'} ${className}`}
      style={[cardShadow, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View className="mb-4 flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}
