import { forwardRef, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Text, { fontFamilyFor } from './Text';
import { Icon } from './Icon';
import { usePalette } from '@/hooks/useTheme';

export const fieldBase =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 dark:bg-ink-800 dark:text-slate-100';
export const fieldState = (error?: string) =>
  error
    ? 'border-rose-400 focus:border-rose-500 dark:border-rose-500/70'
    : 'border-slate-300 focus:border-brand-500 dark:border-ink-700 dark:focus:border-brand-400';

export function Field({ label, error, hint, children, className = '' }: {
  label?: string; error?: string; hint?: string; children: ReactNode; className?: string;
}) {
  return (
    <View className={className}>
      {label ? <Text className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</Text> : null}
      {children}
      {error ? (
        <Text accessibilityRole="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</Text>
      ) : null}
    </View>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  className?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, className = '', wrapperClassName = '', style, ...props },
  ref
) {
  const p = usePalette();
  return (
    <Field label={label} error={error} hint={hint} className={wrapperClassName}>
      <View className="justify-center">
        {leftIcon ? (
          <View pointerEvents="none" className="absolute left-3.5 z-10">
            <Icon as={leftIcon} size={16} className="text-slate-400" />
          </View>
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? props.placeholder}
          placeholderTextColor={p.placeholder}
          selectionColor={p.brandSolid}
          className={`${fieldBase} ${fieldState(error)} h-11 ${leftIcon ? 'pl-10' : ''} ${className}`}
          style={[{ fontFamily: fontFamilyFor(className), paddingVertical: 0, textAlignVertical: 'center' }, style]}
          {...props}
        />
      </View>
    </Field>
  );
});

export const Textarea = forwardRef<TextInput, InputProps>(function Textarea(
  { label, error, hint, className = '', wrapperClassName = '', style, ...props },
  ref
) {
  const p = usePalette();
  return (
    <Field label={label} error={error} hint={hint} className={wrapperClassName}>
      <TextInput
        ref={ref}
        multiline
        numberOfLines={3}
        accessibilityLabel={label ?? props.placeholder}
        placeholderTextColor={p.placeholder}
        selectionColor={p.brandSolid}
        className={`${fieldBase} ${fieldState(error)} min-h-[88px] py-2.5 ${className}`}
        style={[{ fontFamily: fontFamilyFor(className), textAlignVertical: 'top' }, style]}
        {...props}
      />
    </Field>
  );
});
