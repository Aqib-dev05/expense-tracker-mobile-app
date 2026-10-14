import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';
import { AlertTriangle, type LucideIcon } from 'lucide-react-native';
import Text from './Text';
import Button from './Button';
import { Icon } from './Icon';

export function Skeleton({ className = '' }: { className?: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ opacity }} className={`rounded-lg bg-slate-200/80 dark:bg-ink-800 ${className}`} />;
}

export function LoadingState({ label = 'Loading…', fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <View
      className={`items-center justify-center ${fullScreen ? 'flex-1 bg-slate-50 dark:bg-ink-950' : 'py-16'}`}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator size="large" color="#2f45dc" />
    </View>
  );
}

/** Row-shaped placeholders for lists. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} className={`flex-row items-center gap-3 px-4 py-4 ${i ? 'border-t border-slate-100 dark:border-ink-800' : ''}`}>
          <Skeleton className="h-10 w-10 rounded-xl" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </View>
          <Skeleton className="h-4 w-20" />
        </View>
      ))}
    </View>
  );
}

export function CardSkeleton({ height = 'h-32' }: { height?: string }) {
  return <Skeleton className={`${height} w-full rounded-2xl`} />;
}

export function EmptyState({ icon, title, description, action }: {
  icon?: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <View className="items-center px-6 py-14">
      {icon && (
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/15">
          <Icon as={icon} size={28} className="text-brand-600 dark:text-brand-300" />
        </View>
      )}
      <Text className="text-center text-base font-bold text-slate-900 dark:text-white">{title}</Text>
      {description ? <Text className="mt-1.5 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">{description}</Text> : null}
      {action ? <View className="mt-5">{action}</View> : null}
    </View>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry, compact = false }: {
  message?: string; onRetry?: () => void; compact?: boolean;
}) {
  return (
    <View className={`items-center ${compact ? 'px-4 py-8' : 'px-6 py-14'}`} accessibilityRole="alert">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/15">
        <Icon as={AlertTriangle} size={24} className="text-rose-600 dark:text-rose-300" />
      </View>
      <Text className="text-base font-bold text-slate-900 dark:text-white">Couldn’t load this</Text>
      <Text className="mt-1.5 max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">{message}</Text>
      {onRetry ? <Button variant="secondary" size="sm" className="mt-4" onPress={onRetry}>Try again</Button> : null}
    </View>
  );
}
