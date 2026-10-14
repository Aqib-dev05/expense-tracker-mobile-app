import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Text from './Text';
import { Icon } from './Icon';

const MAX_W = { sm: 448, md: 512, lg: 672 };

/** Bottom sheet on phones, centred dialog from 640dp up (same behaviour as the web modal). */
export default function Modal({ open, onClose, title, children, footer, size = 'md', scroll = true }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof MAX_W;
  scroll?: boolean;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 640;

  return (
    <RNModal
      visible={open}
      transparent
      animationType={wide ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className={`flex-1 ${wide ? 'items-center justify-center p-4' : 'justify-end'}`}>
          <Pressable className="absolute inset-0 bg-slate-950/50" onPress={onClose} accessibilityLabel="Close" />
          <View
            accessibilityViewIsModal
            className={`w-full bg-white dark:bg-ink-900 ${wide ? 'rounded-2xl' : 'rounded-t-3xl'}`}
            style={{ maxHeight: wide ? '90%' : '92%', maxWidth: wide ? MAX_W[size] : undefined, elevation: 12 }}
          >
            <View className="flex-row items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-ink-800">
              <Text className="flex-1 text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>{title}</Text>
              <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={8} className="-mr-1.5 rounded-lg p-2 active:bg-slate-100 dark:active:bg-ink-800">
                <Icon as={X} size={20} className="text-slate-500 dark:text-slate-400" />
              </Pressable>
            </View>
            {scroll ? (
              <ScrollView className="shrink" contentContainerClassName="px-5 py-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              <View className="shrink px-5 py-5">{children}</View>
            )}
            {footer ? (
              <View className="border-t border-slate-100 px-5 pt-4 dark:border-ink-800" style={{ paddingBottom: 16 + (wide ? 0 : insets.bottom) }}>
                {footer}
              </View>
            ) : (
              <View style={{ height: wide ? 0 : insets.bottom }} />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
