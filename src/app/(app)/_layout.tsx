import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AppDataProvider } from '@/store/AppDataContext';
import { AppHeader, BottomNav } from '@/components/AppShell';
import useBudgetAlerts from '@/hooks/useBudgetAlerts';

function Shell() {
  useBudgetAlerts();

  // Tapping a budget alert opens the Budgets tab.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      if (res.notification.request.content.data?.budgetId) router.navigate('/budgets');
    });
    return () => sub.remove();
  }, []);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-ink-950">
      <AppHeader />
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="transactions" />
        <Tabs.Screen name="budgets" />
        <Tabs.Screen name="analytics" />
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

export default function AppLayout() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}
