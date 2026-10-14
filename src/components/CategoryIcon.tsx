import { View } from 'react-native';
import Text from './ui/Text';
import { categoryMeta } from '@/constants';

const DIM = {
  sm: { box: 'h-8 w-8', text: 'text-base' },
  md: { box: 'h-10 w-10', text: 'text-xl' },
  lg: { box: 'h-12 w-12', text: 'text-2xl' },
};

/** Emoji tile tinted with the category colour. */
export default function CategoryIcon({ category, size = 'md' }: { category: string; size?: keyof typeof DIM }) {
  const { emoji, color } = categoryMeta(category);
  const d = DIM[size];
  return (
    <View className={`${d.box} items-center justify-center rounded-xl`} style={{ backgroundColor: `${color}22` }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text className={d.text}>{emoji}</Text>
    </View>
  );
}
