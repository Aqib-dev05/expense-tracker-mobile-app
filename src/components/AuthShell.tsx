import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Sun } from 'lucide-react-native';
import Logo from './Logo';
import { Icon } from './ui/Icon';
import { cardShadow } from './ui/Card';
import { usePreferences } from '@/store/PreferencesContext';

/** Web AuthLayout: centred logo + card, theme toggle top-right. */
export default function AuthShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = usePreferences();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-slate-50 dark:bg-ink-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 40, paddingTop: insets.top + 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo className="mb-8" />
          <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900" style={cardShadow}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Pressable
        onPress={toggleTheme}
        accessibilityLabel="Toggle theme"
        className="absolute right-4 rounded-xl p-2.5 active:bg-slate-100 dark:active:bg-ink-800"
        style={{ top: insets.top + 8 }}
      >
        <Icon as={theme === 'dark' ? Sun : Moon} size={20} className="text-slate-500 dark:text-slate-400" />
      </Pressable>
    </View>
  );
}
