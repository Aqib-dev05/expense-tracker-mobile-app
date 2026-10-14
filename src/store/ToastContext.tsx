import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import Text from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: number; type: ToastType; message: string }
interface ToastApi { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }

const ToastContext = createContext<ToastApi | null>(null);

const STYLES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, cls: 'text-rose-600 dark:text-rose-400' },
  info: { icon: Info, cls: 'text-brand-600 dark:text-brand-400' },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [opacity]);
  const { icon, cls } = STYLES[toast.type];

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }}>
      <View
        accessibilityRole="alert"
        className="w-full flex-row items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-ink-700 dark:bg-ink-800"
        style={{ elevation: 6, shadowColor: '#0f172a', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
      >
        <Icon as={icon} size={20} className={`mt-0.5 ${cls}`} />
        <Text className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{toast.message}</Text>
        <Pressable onPress={() => onDismiss(toast.id)} accessibilityLabel="Dismiss" hitSlop={8}>
          <Icon as={X} size={16} className="text-slate-400" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type: ToastType, message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
  }, [dismiss]);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View pointerEvents="box-none" className="absolute inset-x-0 top-0 z-50 gap-2 px-4" style={{ paddingTop: insets.top + 8, elevation: 50 }}>
        {toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={dismiss} />)}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext)!;
