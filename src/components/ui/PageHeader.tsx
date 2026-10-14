import type { ReactNode } from 'react';
import { View } from 'react-native';
import Text from './Text';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <View className="mb-6 gap-4">
      <View className="min-w-0">
        <Text className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</Text> : null}
      </View>
      {actions ? <View className="flex-row flex-wrap items-center gap-2">{actions}</View> : null}
    </View>
  );
}
