import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import Text from './Text';
import { Icon } from './Icon';
import Modal from './Modal';
import { Field, fieldBase, fieldState } from './Input';

export type Option = string | { value: string; label: string };
const norm = (o: Option) => (typeof o === 'string' ? { value: o, label: o } : o);

/** Native-feeling replacement for the web <select>: a field that opens a bottom-sheet list. */
export default function Select({
  label, error, hint, options, placeholder, value, onChange, disabled, wrapperClassName = '', title,
}: {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  /** When defined, an empty "all"-style entry is shown first and used for the empty value. */
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  wrapperClassName?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const items = options.map(norm);
  const selected = items.find((o) => o.value === value);
  const sheetTitle = title || label || placeholder || 'Select';
  const rows = placeholder !== undefined ? [{ value: '', label: placeholder }, ...items] : items;

  return (
    <Field label={label} error={error} hint={hint} className={wrapperClassName}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${sheetTitle}: ${selected?.label ?? placeholder ?? 'none'}`}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`${fieldBase} ${fieldState(error)} h-11 flex-row items-center justify-between gap-2 ${disabled ? 'opacity-60' : ''}`}
      >
        <Text numberOfLines={1} className={`flex-1 text-sm ${selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Icon as={ChevronDown} size={16} className="text-slate-400" />
      </Pressable>

      <Modal open={open} onClose={() => setOpen(false)} title={sheetTitle} size="sm" scroll={false}>
        <ScrollView style={{ maxHeight: 420 }} className="-mx-5" showsVerticalScrollIndicator={false}>
          {rows.map((o, i) => {
            const active = o.value === value;
            return (
              <Pressable
                key={`${o.value}-${i}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => { onChange(o.value); setOpen(false); }}
                className="flex-row items-center justify-between gap-3 px-5 py-3.5 active:bg-slate-50 dark:active:bg-ink-800"
              >
                <Text className={`flex-1 text-[15px] ${active ? 'font-bold text-brand-700 dark:text-brand-200' : 'font-medium text-slate-800 dark:text-slate-100'}`}>
                  {o.label}
                </Text>
                {active ? <Icon as={Check} size={18} className="text-brand-600 dark:text-brand-300" /> : <View className="h-[18px] w-[18px]" />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Modal>
    </Field>
  );
}
