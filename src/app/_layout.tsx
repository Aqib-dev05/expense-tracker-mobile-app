import '../../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useColorScheme } from 'nativewind';
import {
  useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { CACHE_MAX_AGE, persister, queryClient, setupQueryEnvironment } from '@/lib/queryClient';
import { ensureChannels } from '@/lib/notifications';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { PreferencesProvider, usePreferences } from '@/store/PreferencesContext';
import { ToastProvider } from '@/store/ToastContext';
import { LoadingState } from '@/components/ui/States';

SplashScreen.preventAutoHideAsync().catch(() => {});
setupQueryEnvironment();

function Routes() {
  const { user, loading } = useAuth();
  const { ready } = usePreferences();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!loading && ready) SplashScreen.hideAsync().catch(() => {});
  }, [loading, ready]);

  if (loading || !ready) return <LoadingState fullScreen label="Checking your session…" />;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-ink-950">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0a0f1e' : '#f8fafc' } }}>
        <Stack.Protected guard={Boolean(user)}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  useEffect(() => { ensureChannels().catch(() => {}); }, []);

  if (!fontsLoaded) return null; // splash screen stays visible

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: CACHE_MAX_AGE }}>
          <PreferencesProvider>
            <ToastProvider>
              <AuthProvider>
                <Routes />
              </AuthProvider>
            </ToastProvider>
          </PreferencesProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
