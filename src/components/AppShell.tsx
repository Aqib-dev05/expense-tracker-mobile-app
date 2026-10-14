import { useState } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname, type Tabs } from 'expo-router';
import {
  BarChart3, FileText, LayoutDashboard, LogOut, Menu, Moon, PiggyBank, Plus, Receipt, Settings, Sun, WifiOff, X,
  type LucideIcon,
} from 'lucide-react-native';
import Logo from './Logo';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Text from './ui/Text';
import { Icon } from './ui/Icon';
import { useAppData } from '@/store/AppDataContext';
import { useAuth } from '@/store/AuthContext';
import { usePreferences } from '@/store/PreferencesContext';
import useOnline from '@/hooks/useOnline';

type Href = '/' | '/transactions' | '/budgets' | '/analytics' | '/reports' | '/settings';

const MAIN_NAV: { to: Href; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const isActive = (path: string, to: Href) => (to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`));

function NavItem({ to, label, icon, active, onPress }: { to: Href; label: string; icon: LucideIcon; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${active ? 'bg-brand-50 dark:bg-brand-500/15' : 'active:bg-slate-100 dark:active:bg-ink-800'}`}
    >
      <Icon as={icon} size={18} className={active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 dark:text-slate-300'} />
      <Text className={`text-sm font-semibold ${active ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 dark:text-slate-300'}`}>{label}</Text>
    </Pressable>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = usePreferences();
  const go = (to: Href) => { onClose(); router.navigate(to); };

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View className="flex-1 flex-row">
        <View
          accessibilityViewIsModal
          className="h-full w-[304px] max-w-[85%] bg-white px-4 dark:bg-ink-900"
          style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20, elevation: 16 }}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Logo />
            <Pressable onPress={onClose} accessibilityLabel="Close menu" className="rounded-xl p-2.5 active:bg-slate-100 dark:active:bg-ink-800">
              <Icon as={X} size={20} className="text-slate-500 dark:text-slate-400" />
            </Pressable>
          </View>

          <View className="flex-1 gap-1">
            {MAIN_NAV.map((n) => <NavItem key={n.to} {...n} active={isActive(path, n.to)} onPress={() => go(n.to)} />)}
            <View className="mt-auto gap-1 border-t border-slate-100 pt-3 dark:border-ink-800">
              <NavItem to="/settings" label="Settings" icon={Settings} active={isActive(path, '/settings')} onPress={() => go('/settings')} />
            </View>
          </View>

          {user ? (
            <View className="mt-3 flex-row items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-ink-800/60">
              <Avatar user={user} />
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</Text>
                <Text numberOfLines={1} className="text-xs text-slate-500 dark:text-slate-400">{user.email}</Text>
              </View>
              <Pressable onPress={toggleTheme} accessibilityLabel="Toggle theme" className="rounded-lg p-2 active:bg-slate-200/60 dark:active:bg-ink-700">
                <Icon as={theme === 'dark' ? Sun : Moon} size={16} className="text-slate-500 dark:text-slate-400" />
              </Pressable>
            </View>
          ) : null}
          <Button variant="secondary" icon={LogOut} className="mt-3 w-full" onPress={() => { onClose(); logout(); }}>Log out</Button>
        </View>
        <Pressable className="flex-1 bg-slate-950/50" onPress={onClose} accessibilityLabel="Close menu" />
      </View>
    </RNModal>
  );
}

/** Top bar: menu button, logo, and an offline hint (cached data is still shown). */
export function AppHeader() {
  const insets = useSafeAreaInsets();
  const [drawer, setDrawer] = useState(false);
  const online = useOnline();

  return (
    <View className="border-b border-slate-200 bg-white/95 dark:border-ink-800 dark:bg-ink-900/95" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable onPress={() => setDrawer(true)} accessibilityLabel="Open menu" className="-ml-2 rounded-xl p-2.5 active:bg-slate-100 dark:active:bg-ink-800">
          <Icon as={Menu} size={20} className="text-slate-700 dark:text-slate-200" />
        </Pressable>
        <Logo />
        <View className="w-10 items-end">
          {!online ? <Icon as={WifiOff} size={18} className="text-amber-600 dark:text-amber-400" /> : null}
        </View>
      </View>
      {!online ? (
        <View className="bg-amber-50 px-4 py-1.5 dark:bg-amber-500/10">
          <Text className="text-center text-xs font-semibold text-amber-800 dark:text-amber-300">You’re offline — showing saved data</Text>
        </View>
      ) : null}
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
    </View>
  );
}

const TABS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'index', label: 'Home', icon: LayoutDashboard },
  { name: 'transactions', label: 'Activity', icon: Receipt },
  { name: 'budgets', label: 'Budgets', icon: PiggyBank },
  { name: 'analytics', label: 'Analytics', icon: BarChart3 },
];

/** Bottom navigation with a raised, centred "add transaction" button (same layout as the web mobile nav). */
type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { openTransactionForm } = useAppData();
  const current = state.routes[state.index]?.name;

  const tab = (t: (typeof TABS)[number]) => {
    const active = current === t.name;
    return (
      <Pressable
        key={t.name}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => navigation.navigate(t.name)}
        className="flex-1 items-center justify-center gap-1 py-2"
      >
        <Icon as={t.icon} size={20} className={active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'} />
        <Text className={`text-[11px] font-semibold ${active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'}`}>{t.label}</Text>
      </Pressable>
    );
  };

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 dark:border-ink-800 dark:bg-ink-900/95"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="w-full max-w-lg flex-row items-end self-center px-2">
        {tab(TABS[0])}
        {tab(TABS[1])}
        <View className="flex-1 items-center">
          <Pressable
            onPress={() => openTransactionForm()}
            accessibilityRole="button"
            accessibilityLabel="Add transaction"
            className="-mt-5 h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 active:scale-95"
            style={{ elevation: 8, shadowColor: '#2f45dc', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }}
          >
            <Icon as={Plus} size={24} color="#ffffff" className="text-white" />
          </Pressable>
        </View>
        {tab(TABS[2])}
        {tab(TABS[3])}
      </View>
    </View>
  );
}
