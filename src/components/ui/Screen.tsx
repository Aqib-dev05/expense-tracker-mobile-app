import { useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/queryClient';

/**
 * Page container: scrollable, padded like the web `<main>` (px-4 pt-6 pb-28) with room for the bottom nav,
 * plus pull-to-refresh which refetches every active query.
 */
export default function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await queryClient.invalidateQueries(); } finally { setRefreshing(false); }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 112 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2f45dc']} progressBackgroundColor="#ffffff" />}
    >
      <View className="w-full max-w-7xl self-center">{children}</View>
    </ScrollView>
  );
}
