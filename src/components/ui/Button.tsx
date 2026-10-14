import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Text from './Text';
import { Icon } from './Icon';

const variants = {
  primary: { box: 'bg-brand-600 active:bg-brand-700', text: 'text-white', spinner: '#ffffff' },
  secondary: {
    box: 'border border-slate-300 bg-white active:bg-slate-50 dark:border-ink-700 dark:bg-ink-800 dark:active:bg-ink-700',
    text: 'text-slate-700 dark:text-slate-200',
    spinner: '#64748b',
  },
  ghost: { box: 'active:bg-slate-100 dark:active:bg-ink-800', text: 'text-slate-600 dark:text-slate-300', spinner: '#64748b' },
  danger: { box: 'bg-rose-600 active:bg-rose-700', text: 'text-white', spinner: '#ffffff' },
};
const sizes = {
  sm: { box: 'h-10 px-3', text: 'text-sm' },
  md: { box: 'h-11 px-4', text: 'text-sm' },
  lg: { box: 'h-12 px-5', text: 'text-base' },
  icon: { box: 'h-10 w-10', text: 'text-sm' },
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: LucideIcon;
  className?: string;
  children?: string;
}

export default function Button({
  variant = 'primary', size = 'md', loading = false, disabled, icon, className = '', children, ...props
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: loading }}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${v.box} ${s.box} ${disabled || loading ? 'opacity-60' : ''} ${className}`}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={v.spinner} />}
      {!loading && icon && <Icon as={icon} size={size === 'lg' ? 18 : 16} className={v.text} />}
      {children ? <Text className={`font-semibold ${v.text} ${s.text}`}>{children}</Text> : null}
    </Pressable>
  );
}
