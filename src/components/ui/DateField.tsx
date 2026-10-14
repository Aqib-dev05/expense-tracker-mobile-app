import { Pressable, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import Text from './Text';
import { Icon } from './Icon';
import { Field, fieldBase, fieldState } from './Input';
import useFormat from '@/hooks/useFormat';
import { formatDateInput, fromDateInput, toDateInput } from '@/utils/format';

/**
 * Replacement for <input type="date">. Value is a local 'YYYY-MM-DD' string (what the API expects);
 * tapping opens Android's native date-picker dialog.
 */
export default function DateField({
  label, value, onChange, error, hint, min, max, clearable = false, placeholder = 'Select date', wrapperClassName = '',
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
}) {
  const fmt = useFormat();

  const open = () =>
    DateTimePickerAndroid.open({
      value: fromDateInput(value),
      mode: 'date',
      minimumDate: min ? fromDateInput(min) : undefined,
      maximumDate: max ? fromDateInput(max) : undefined,
      onValueChange: (_e, date) => onChange(toDateInput(date)),
    });

  return (
    <Field label={label} error={error} hint={hint} className={wrapperClassName}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? placeholder}: ${value ? formatDateInput(value, fmt.dateFormat) : 'not set'}`}
        onPress={open}
        className={`${fieldBase} ${fieldState(error)} h-11 flex-row items-center gap-2.5`}
      >
        <Icon as={Calendar} size={16} className="text-slate-400" />
        <Text numberOfLines={1} className={`flex-1 text-sm ${value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {value ? formatDateInput(value, fmt.dateFormat) : placeholder}
        </Text>
        {clearable && value ? (
          <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel="Clear date">
            <View className="rounded-full p-0.5"><Icon as={X} size={16} className="text-slate-400" /></View>
          </Pressable>
        ) : null}
      </Pressable>
    </Field>
  );
}
