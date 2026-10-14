import { Image, View } from 'react-native';
import Text from './Text';

const DIM = {
  sm: { box: 'h-8 w-8', text: 'text-xs', px: 32 },
  md: { box: 'h-10 w-10', text: 'text-sm', px: 40 },
  lg: { box: 'h-20 w-20', text: 'text-2xl', px: 80 },
};

export default function Avatar({ user, size = 'md' }: { user?: { name?: string; avatar?: string } | null; size?: keyof typeof DIM }) {
  const d = DIM[size];
  if (user?.avatar) {
    return <Image source={{ uri: user.avatar }} style={{ width: d.px, height: d.px, borderRadius: d.px / 2 }} accessibilityIgnoresInvertColors />;
  }
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View className={`${d.box} items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20`}>
      <Text className={`${d.text} font-bold text-brand-700 dark:text-brand-200`}>{initials}</Text>
    </View>
  );
}
